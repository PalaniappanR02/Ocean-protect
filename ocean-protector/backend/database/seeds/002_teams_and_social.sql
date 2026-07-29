INSERT INTO response_teams (name, agency, location_name, latitude, longitude, location, status, member_count, capabilities, contact_number, is_synthetic) VALUES
('Chennai Coastal Rescue', 'NDRF', 'Chennai', 13.0827, 80.2707, ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography, 'available', 25, '["flood_rescue", "boat_operations"]', '044-12345678', true),
('Kerala Marine Enforcement', 'Kerala Police', 'Kochi', 9.9816, 76.2999, ST_SetSRID(ST_MakePoint(76.2999, 9.9816), 4326)::geography, 'available', 15, '["patrol", "evacuation"]', '0484-98765432', true),
('Mangaluru Disaster Response', 'KSDMA', 'Mangaluru', 12.8700, 74.8800, ST_SetSRID(ST_MakePoint(74.8800, 12.8700), 4326)::geography, 'available', 20, '["flood_rescue", "medical"]', '0824-55566677', true)
ON CONFLICT DO NOTHING;

INSERT INTO social_signals (platform, text, language_code, location_name, latitude, longitude, location, hazard_type, inferred_severity, observed_at, is_synthetic, data_source) VALUES
('twitter', 'Massive flooding near Marina beach! Roads are submerged.', 'en', 'Chennai', 13.0500, 80.2820, ST_SetSRID(ST_MakePoint(80.2820, 13.0500), 4326)::geography, 'coastal_flooding', 'critical', NOW() - INTERVAL '2 hours', true, 'sample_dataset'),
('facebook', 'Waves are very rough today near Vizag port.', 'en', 'Visakhapatnam', 17.6868, 83.2185, ST_SetSRID(ST_MakePoint(83.2185, 17.6868), 4326)::geography, 'high_waves', 'warning', NOW() - INTERVAL '5 hours', true, 'sample_dataset'),
('twitter', 'Oil slick spotted near Kochi harbor. Strong smell.', 'en', 'Kochi', 9.9800, 76.2800, ST_SetSRID(ST_MakePoint(76.2800, 9.9800), 4326)::geography, 'oil_spill', 'warning', NOW() - INTERVAL '1 day', true, 'sample_dataset'),
('news', 'Fishermen advised not to venture into sea due to rough weather.', 'en', 'Mangaluru', 12.8700, 74.8800, ST_SetSRID(ST_MakePoint(74.8800, 12.8700), 4326)::geography, 'storm_surge', 'advisory', NOW() - INTERVAL '12 hours', true, 'sample_dataset')
ON CONFLICT DO NOTHING;