import requests
import polyline
import math
from sqlalchemy import text
from extensions import db

OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

POSITIVE_TYPES = {
    'well_lit', 'safe_area', 'heritage spot', 'green park', 
    'well-maintained road', 'clean zone', 'safe zone', 'smooth traffic', 'police_presence'
}

MODERATE_TYPES = {
    'crowded zone', 'needs minor repair', 'average road', 'moderate traffic', 'busy market', 'no_sidewalk'
}

def get_optimal_routes(start_lat, start_lng, end_lat, end_lng):
    """
    Fetches candidate routes from OSRM, evaluates spatial hazards along each corridor from MySQL,
    and returns:
      - If fastest route has 0 hazards (or no alternative is safer): safest and fastest routes converge.
      - If fastest route has hazards and a detour avoids them: provides distinct safest & fastest paths.
    """
    mid_lat = (start_lat + end_lat) / 2
    mid_lng = (start_lng + end_lng) / 2
    
    dx = end_lng - start_lng
    dy = end_lat - start_lat
    dist = math.sqrt(dx**2 + dy**2)
    
    if dist == 0:
        return {}
        
    # Scale waypoint offset proportionally to trip distance (~35% of trip distance)
    # Bounds: minimum ~350m (0.003 deg) up to ~1.3km (0.012 deg)
    offset = max(0.003, min(0.012, dist * 0.35))
    
    # Left and right perpendicular offset waypoints
    p1_lat = mid_lat + (dx * offset) / dist
    p1_lng = mid_lng - (dy * offset) / dist
    
    p2_lat = mid_lat - (dx * offset) / dist
    p2_lng = mid_lng + (dy * offset) / dist

    urls = [
        f"{OSRM_BASE_URL}/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full",
        f"{OSRM_BASE_URL}/{start_lng},{start_lat};{p1_lng},{p1_lat};{end_lng},{end_lat}?overview=full",
        f"{OSRM_BASE_URL}/{start_lng},{start_lat};{p2_lng},{p2_lat};{end_lng},{end_lat}?overview=full"
    ]
    
    routes = []
    for url in urls:
        try:
            resp = requests.get(url, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                if 'routes' in data and len(data['routes']) > 0:
                    routes.append(data['routes'][0])
        except Exception as e:
            print(f"[OSRM FETCH ERROR] {e}")

    if not routes:
        raise Exception("Failed to communicate with OSRM API or no routes found")
    
    processed_routes = []
    seen_geometries = set()
    
    for idx, route in enumerate(routes):
        encoded_poly = route['geometry']
        if encoded_poly in seen_geometries:
            continue
        seen_geometries.add(encoded_poly)
        
        duration = route['duration'] # seconds
        distance = route['distance'] # meters
        
        # Decode the OSRM Polyline into [(lat, lng), ...]
        coords = polyline.decode(encoded_poly)
        
        # Deduplicate consecutive identical vertices
        deduped = []
        for pt in coords:
            if not deduped or deduped[-1] != pt:
                deduped.append(pt)
        if len(deduped) < 2:
            deduped = coords
        
        # Convert to WKT LineString for MySQL ST_Distance spatial query (SRID 4326: POINT(lon lat))
        wkt_coords = ", ".join([f"{lon} {lat}" for lat, lon in deduped])
        linestring_wkt = f"LINESTRING({wkt_coords})"

        # Query database hazards within 50 meters of this route corridor
        query = text("""
            SELECT hazard_type, severity_score 
            FROM spatial_hazards 
            WHERE ST_Distance(location, ST_GeomFromText(:ls, 4326)) < 50
        """)
        
        try:
            hazards = db.session.execute(query, {"ls": linestring_wkt}).fetchall()
        except Exception as db_err:
            print(f"[SPATIAL QUERY WARNING] {db_err}")
            hazards = []
        
        # Classify spots into positive, minor cautions, and genuine hazards
        penalty_seconds = 0
        actual_hazards_count = 0
        positive_spots_count = 0
        
        for h in hazards:
            htype = (h[0] or '').strip().lower()
            score = float(h[1]) if h[1] is not None else 1.0
            
            if htype in POSITIVE_TYPES:
                positive_spots_count += 1
                penalty_seconds = max(0, penalty_seconds - 30) # Safety bonus
            elif htype in MODERATE_TYPES and score <= 2.0:
                # Mild caution (e.g., average road, mild market traffic)
                penalty_seconds += 20
            else:
                # Genuine hazard (pothole, construction, flooding, accident, poor lighting, etc.)
                actual_hazards_count += 1
                if score <= 1.8:
                    penalty_seconds += 60   # Minor hazard -> +1 min penalty
                elif score <= 3.2:
                    penalty_seconds += 180  # Moderate hazard -> +3 min penalty
                else:
                    penalty_seconds += 300  # High hazard -> +5 min penalty
                
        total_cost = duration + penalty_seconds
        
        mins = max(1, round(duration / 60))
        dist_km = round(distance / 1000, 1)
        
        route_data = {
            "id": idx,
            "geometry": encoded_poly,
            "path": coords,
            "duration_sec": duration,
            "distance_m": distance,
            "penalty_sec": penalty_seconds,
            "total_cost": total_cost,
            "hazards_encountered": actual_hazards_count,
            "positive_count": positive_spots_count,
            "time": f"{mins} mins",
            "distance_str": f"{dist_km} km"
        }
        processed_routes.append(route_data)
        
    if not processed_routes:
        return {}

    # 1. Identify the direct Fastest Route (strictly lowest driving duration)
    fastest_route = min(processed_routes, key=lambda x: x['duration_sec'])
    
    # 2. Determine Safest Route according to real database hazard data:
    # Rule A: If fastest route already has 0 hazards, it is ALREADY 100% safe!
    #         Detouring is completely unnecessary and counterproductive.
    if fastest_route['hazards_encountered'] == 0:
        safest_route = fastest_route
        is_same_route = True
        safe_desc = "Optimal corridor verified safe. 0 reported hazards detected along the direct path."
        fast_desc = "Direct route via shortest street distance (0 hazards detected)."
    else:
        # Rule B: Fastest route has hazards. Look for an alternative that is STRICTLY SAFER.
        alternatives = [r for r in processed_routes if r['geometry'] != fastest_route['geometry']]
        
        # Candidates must have strictly fewer hazards than the fastest route
        safer_alternatives = [r for r in alternatives if r['hazards_encountered'] < fastest_route['hazards_encountered']]
        
        if safer_alternatives:
            # Pick the alternative with lowest hazard count (lowest total_cost as tie-breaker)
            safest_route = min(safer_alternatives, key=lambda x: (x['hazards_encountered'], x['total_cost']))
            is_same_route = False
            
            hazard_diff = fastest_route['hazards_encountered'] - safest_route['hazards_encountered']
            if safest_route['hazards_encountered'] == 0:
                safe_desc = f"Safer detour. Bypasses all {hazard_diff} reported hazard(s) on direct path (0 hazards on this route)."
            else:
                safe_desc = f"Safer detour. Bypasses {hazard_diff} reported hazard(s) along the direct path."
                
            fast_desc = f"Direct route via shortest street distance. Passes {fastest_route['hazards_encountered']} hazard(s)."
        else:
            # No alternative is safer (detours have equal or more hazards)
            safest_route = fastest_route
            is_same_route = True
            safe_desc = f"Direct route is the optimal safety path. Passes {fastest_route['hazards_encountered']} minor caution spot(s) with no safer detours available."
            fast_desc = f"Direct route via shortest street distance. Passes {fastest_route['hazards_encountered']} hazard(s)."

    return {
        "is_same_route": is_same_route,
        "safest_route": {
            "description": safe_desc,
            "time": safest_route['time'],
            "distance": safest_route['distance_str'],
            "path": safest_route['path'],
            "hazard_count": safest_route['hazards_encountered'],
            "positive_count": safest_route['positive_count']
        },
        "fastest_route": {
            "description": fast_desc,
            "time": fastest_route['time'],
            "distance": fastest_route['distance_str'],
            "path": fastest_route['path'],
            "hazard_count": fastest_route['hazards_encountered'],
            "positive_count": fastest_route['positive_count']
        }
    }
