import requests
import polyline
import math
from sqlalchemy import text
from extensions import db

OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

def get_optimal_routes(start_lat, start_lng, end_lat, end_lng):
    """
    Fetches multiple distinct alternative routes from OSRM by injecting proportional waypoints,
    decodes their polylines, and overlays MySQL Spatial Hazard Data (spatial_hazards)
    to strictly separate the direct Fastest route from an alternative Safest route.
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
        
        # Convert to WKT LineString for MySQL ST_Distance spatial query
        wkt_coords = ", ".join([f"{lon} {lat}" for lat, lon in coords])
        linestring_wkt = f"LINESTRING({wkt_coords})"
        
        # Spatial Database Query (SRID 4326)
        query = text("""
            SELECT severity_score 
            FROM spatial_hazards 
            WHERE ST_Distance(location, ST_GeomFromText(:ls, 4326)) < 50
        """)
        
        try:
            hazards = db.session.execute(query, {"ls": linestring_wkt}).fetchall()
        except Exception as db_err:
            print(f"[SPATIAL QUERY WARNING] {db_err}")
            hazards = []
        
        # Calculate penalty for hazards near route
        penalty_seconds = 0
        for h in hazards:
            score = float(h[0]) if h[0] is not None else 1.0
            if score <= 1.0:
                penalty_seconds += 60   # Minor caution -> +1 min penalty
            elif score <= 2.0:
                penalty_seconds += 180  # Moderate caution -> +3 min penalty
            else:
                penalty_seconds += 300  # High danger -> +5 min penalty
                
        total_cost = duration + penalty_seconds
        
        # Formatted duration string
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
            "hazards_encountered": len(hazards),
            "time": f"{mins} mins",
            "distance_str": f"{dist_km} km"
        }
        processed_routes.append(route_data)
        
    if not processed_routes:
        return {}

    # 1. Identify the direct Fastest Route (strictly the lowest base duration)
    fastest_route = min(processed_routes, key=lambda x: x['duration_sec'])
    
    # 2. Identify distinct Alternative Routes
    alternatives = [r for r in processed_routes if r['geometry'] != fastest_route['geometry']]
    
    if alternatives:
        # Prioritize the alternative with the fewest hazards; if tied, lowest total cost
        safest_route = min(alternatives, key=lambda x: (x['hazards_encountered'], x['total_cost']))
        
        hazard_diff = fastest_route['hazards_encountered'] - safest_route['hazards_encountered']
        if hazard_diff > 0:
            safe_desc = f"Safer detour. Bypasses {hazard_diff} reported hazard(s) along the direct path."
        elif safest_route['hazards_encountered'] == 0:
            safe_desc = "Zero hazards detected. Well-lit alternative perimeter route."
        else:
            safe_desc = f"Alternative arterial corridor. Passes {safest_route['hazards_encountered']} hazard(s) in proximity."
            
        fast_desc = f"Direct route via shortest street distance. Passes {fastest_route['hazards_encountered']} hazard(s)."
    else:
        # Fallback if only 1 route could possibly be generated
        safest_route = fastest_route
        safe_desc = "Primary route. No alternative detours available for this endpoint."
        fast_desc = "Direct route via shortest street distance."

    return {
        "safest_route": {
            "description": safe_desc,
            "time": safest_route['time'],
            "distance": safest_route['distance_str'],
            "path": safest_route['path'],
            "hazard_count": safest_route['hazards_encountered']
        },
        "fastest_route": {
            "description": fast_desc,
            "time": fastest_route['time'],
            "distance": fastest_route['distance_str'],
            "path": fastest_route['path'],
            "hazard_count": fastest_route['hazards_encountered']
        }
    }
