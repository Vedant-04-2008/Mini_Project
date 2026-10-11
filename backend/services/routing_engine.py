import requests
import polyline
import math
from sqlalchemy import text
from extensions import db

OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

def get_optimal_routes(start_lat, start_lng, end_lat, end_lng):
    """
    Fetches alternative routes from OSRM by injecting midpoints,
    decodes their polylines, and overlays MySQL Spatial Hazard Data 
    to penalize unsafe segments.
    """
    # 1. Calculate synthetic waypoints to force OSRM to generate alternative routes.
    # The public OSRM often only returns 1 route even if alternatives=3 is passed.
    mid_lat = (start_lat + end_lat) / 2
    mid_lng = (start_lng + end_lng) / 2
    
    dx = end_lng - start_lng
    dy = end_lat - start_lat
    dist = math.sqrt(dx**2 + dy**2)
    
    if dist == 0:
        return {}
        
    offset = 0.010 # Roughly 1km offset in coordinate degrees
    
    # Left and right offset points
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
    # 2. Fetch routes
    for url in urls:
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            if 'routes' in data:
                routes.extend(data['routes'])

    if not routes:
        raise Exception("Failed to communicate with OSRM API or no routes found")
    
    processed_routes = []
    
    # Track unique paths to avoid duplicates (sometimes midpoints don't change the path)
    seen_paths = set()
    
    for idx, route in enumerate(routes):
        encoded_poly = route['geometry']
        if encoded_poly in seen_paths:
            continue
        seen_paths.add(encoded_poly)
        
        duration = route['duration'] # Base cost in seconds
        distance = route['distance'] # Meters
        
        # 3. Decode the OSRM Polyline into [(lat, lng), ...]
        coords = polyline.decode(encoded_poly)
        
        # 4. Convert to WKT LineString for MySQL intersection
        wkt_coords = ", ".join([f"{lon} {lat}" for lat, lon in coords])
        linestring_wkt = f"LINESTRING({wkt_coords})"
        
        # 5. Spatial Database Query
        query = text("""
            SELECT severity_score 
            FROM spatial_hazards 
            WHERE ST_Distance(location, ST_GeomFromText(:ls, 4326)) < 50
        """)
        
        hazards = db.session.execute(query, {"ls": linestring_wkt}).fetchall()
        
        # 6. Graph Cost Algorithm (Penalty Scoring)
        penalty_seconds = 0
        for h in hazards:
            score = h[0]
            if score <= 1.0:
                penalty_seconds += 60   # Minor caution -> +1 min penalty
            elif score <= 2.0:
                penalty_seconds += 180  # Hazardous -> +3 min penalty
            else:
                penalty_seconds += 300  # High danger -> +5 min penalty
                
        total_cost = duration + penalty_seconds
        
        route_data = {
            "id": idx,
            "path": coords,
            "duration_sec": duration,
            "distance_m": distance,
            "penalty_sec": penalty_seconds,
            "total_cost": total_cost,
            "hazards_encountered": len(hazards),
            "time": f"{int(duration // 60)} mins",
            "distance_str": f"{round(distance / 1000, 1)} km"
        }
        processed_routes.append(route_data)
        
    if not processed_routes:
        return {}

    # 7. Re-ranking
    # The 'Fastest' route is strictly the lowest base duration
    fastest_route = min(processed_routes, key=lambda x: x['duration_sec'])
    
    # Filter out the fastest route from candidates for the safest route if possible
    # (to make them distinct), UNLESS the fastest is already perfectly safe.
    # We want Safest to be the lowest Total Cost (Duration + Hazard Penalties)
    safest_route = min(processed_routes, key=lambda x: x['total_cost'])
    
    return {
        "safest_route": {
            "description": f"Optimized for safety. Penalized for {safest_route['hazards_encountered']} hazard(s) in proximity.",
            "time": safest_route['time'],
            "distance": safest_route['distance_str'],
            "path": safest_route['path'],
            "hazard_count": safest_route['hazards_encountered']
        },
        "fastest_route": {
            "description": f"Direct route optimized for speed. Passes {fastest_route['hazards_encountered']} hazard(s).",
            "time": fastest_route['time'],
            "distance": fastest_route['distance_str'],
            "path": fastest_route['path'],
            "hazard_count": fastest_route['hazards_encountered']
        }
    }
