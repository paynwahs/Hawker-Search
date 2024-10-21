-- Used to query edge functions within local environment. Change when in cloud 
select vault.create_secret(
  'http://api.supabase.internal:8000',
  'supabase_url'
);

select vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  'supabase_anon_key'
);

-- Insert test users with foodie or hawker roles
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000', -- instance_id
            uuid_generate_v4(),                     -- id
            'authenticated',                        -- aud
            'authenticated',                        -- role
            'user' || (ROW_NUMBER() OVER ()) || '@example.com', -- email
            crypt('password123', gen_salt('bf')),   -- encrypted_password
            current_timestamp,                      -- email_confirmed_at
            current_timestamp,                      -- recovery_sent_at
            current_timestamp,                      -- last_sign_in_at
            '{"provider":"email","providers":["email"]}'::jsonb, -- raw_app_meta_data (jsonb)
            CASE                                    -- raw_user_meta_data (jsonb)
                WHEN (ROW_NUMBER() OVER ()) <= 5 THEN jsonb_build_object('role', 'foodie', 'name', 'User_' || (ROW_NUMBER() OVER ()))
                ELSE jsonb_build_object('role', 'hawker', 'name', 'User_' || (ROW_NUMBER() OVER ()))
            END,
            current_timestamp,                      -- created_at
            current_timestamp,                      -- updated_at
            '',                                     -- confirmation_token
            '',                                     -- email_change
            '',                                     -- email_change_token_new
            ''                                      -- recovery_token
        FROM
            generate_series(1, 45)
    );

-- Insert identities for test users
INSERT INTO
    auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) (
        select
            uuid_generate_v4(),                     -- id
            id,                                     -- user_id
            id,                                     -- provider_id
            format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, -- identity_data (jsonb)
            'email',                                -- provider
            current_timestamp,                      -- last_sign_in_at
            current_timestamp,                      -- created_at
            current_timestamp                       -- updated_at
        from
            auth.users
    );


-- Insert foodies (5 users)
INSERT INTO foodie (favourites_count, user_id)
VALUES
(5, (SELECT id FROM auth.users WHERE email = 'user1@example.com')), -- id = 1
(2, (SELECT id FROM auth.users WHERE email = 'user2@example.com')), -- id = 2
(3, (SELECT id FROM auth.users WHERE email = 'user3@example.com')), -- id = 3
(4, (SELECT id FROM auth.users WHERE email = 'user4@example.com')), -- id = 4
(1, (SELECT id FROM auth.users WHERE email = 'user5@example.com')); -- id = 5

    
-- -- Insert hawkers (5 users with exact locations)
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('Hainan Delights', 'Chinese', '335 Smith St, #02-50 Chinatown Complex, Singapore 050335', FALSE, FALSE, '10:00:00', '20:00:00',  (SELECT id FROM auth.users WHERE email = 'user6@example.com')),
-- ('Spice Haven', 'Indian', '49 Serangoon Road, Singapore 217990', FALSE, TRUE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user7@example.com')),
-- ('Satay King', 'Malay', '14 Scotts Road, Far East Plaza #05-99, Singapore 228213', TRUE, FALSE, '12:00:00', '00:00:00', (SELECT id FROM auth.users WHERE email = 'user8@example.com')),
-- ('Noodle Paradise', 'Thai', '470 North Bridge Road, Bugis Cube, #01-06, Singapore 188735', FALSE, TRUE, '10:00:00', '07:00:00', (SELECT id FROM auth.users WHERE email = 'user9@example.com')),
-- ('The Ramen Shop', 'Japanese', '7 Tanjong Pagar Plaza, #02-104, Singapore 081007', FALSE, FALSE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user10@example.com'));

-- Insert hawkers (5 users with exact locations)
INSERT INTO hawker (name, location, halal, vegetarian, opening, closing, user_id)
VALUES
('Hainan Delights', '335 Smith St, #02-50 Chinatown Complex, Singapore 050335', FALSE, FALSE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user6@example.com')),
('Spice Haven', '49 Serangoon Road, Singapore 217990', FALSE, TRUE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user7@example.com')),
('Satay King', '14 Scotts Road, Far East Plaza #05-99, Singapore 228213', TRUE, FALSE, '12:00:00', '00:00:00', (SELECT id FROM auth.users WHERE email = 'user8@example.com')),
('Noodle Paradise', '470 North Bridge Road, Bugis Cube, #01-06, Singapore 188735', FALSE, TRUE, '10:00:00', '07:00:00', (SELECT id FROM auth.users WHERE email = 'user9@example.com')),
('The Ramen Shop', '7 Tanjong Pagar Plaza, #02-104, Singapore 081007', TRUE, TRUE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user10@example.com')),
('Tian Tian Chicken Rice', 'Tiong Bahru Market', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user11@example.com')),
('Hill Street Fried Kway Teow', 'Maxwell Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user12@example.com')),
('Zam Zam', 'Old Airport Road Food Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user13@example.com')),
('Boon Tong Kee', 'Changi Village Hawker Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user14@example.com')),
('328 Katong Laksa', 'Lau Pa Sat', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user15@example.com')),
('J2 Famous Crispy Curry Puff', 'Newton Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user16@example.com')),
('Ah Heng Curry Chicken Bee Hoon Mee', 'Amoy Street Food Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user17@example.com')),
('Xing Long Cooked Food', 'Golden Mile Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user18@example.com')),
('Tiong Bahru Pau', 'Tekka Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user19@example.com')),
('Nam Sing Hokkien Mee', 'Ghim Moh Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user20@example.com')),
('Chai Chee Nasi Lemak', 'East Coast Lagoon Food Village', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user21@example.com')),
('Outram Park Fried Kway Teow', 'Redhill Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user22@example.com')),
('Fu Ji Hainanese Boneless Chicken Rice', 'Pasir Ris Central Hawker Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user23@example.com')),
('Selera Rasa Nasi Lemak', 'Zion Riverside Food Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user24@example.com')),
('Yi Jia Seafood Soup', 'Bukit Timah Market', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user25@example.com')),
('Guan Kee Wanton Mee', 'Chomp Chomp Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user26@example.com')),
('Song Fa Bak Kut Teh', 'Tampines Round Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user27@example.com')),
('Heng Heng Hainanese Curry Rice', 'Jurong West 505 Food Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user28@example.com')),
('Chuan Kee Satay', 'Clementi 448 Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user29@example.com')),
('No. 18 Zion Road Char Kway Teow', 'West Coast Market', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user30@example.com')),
('A Noodle Story', 'Holland Village Hawker Centre', TRUE, TRUE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user31@example.com')),
('Hai Kee Soy Sauce Chicken Rice', 'Toa Payoh Lorong 8 Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user32@example.com')),
('Hong Lim Laksa', 'Kovan Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user33@example.com')),
('Ah Tai Hainanese Chicken Rice', 'Bendemeer Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user34@example.com')),
('Shi Wei Da Fish Soup', 'Teban Gardens Food Centre', TRUE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user35@example.com')),
('Tian Tian Lai Hokkien Mee', 'Ang Mo Kio Market', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user36@example.com')),
('Jin Jin Dessert', 'Serangoon Garden Market', TRUE, TRUE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user37@example.com')),
('Zhong Guo La Mian Xiao Long Bao', 'Yishun Park Hawker Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user38@example.com')),
('Hup Kee Fried Oyster Omelette', 'Whampoa Makan Place', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user39@example.com')),
('Chey Sua Carrot Cake', 'Geylang Serai Market', TRUE, TRUE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user40@example.com')),
('Lor Mee 178', 'Marine Parade Central Market', FALSE, TRUE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user41@example.com')),
('Wah Kee Big Prawn Noodles', 'Bukit Merah Central', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user42@example.com')),
('Apollo Fresh Cockle Fried Kway Teow', 'Tampines Mall Food Court', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user43@example.com')),
('Katong Ah Soon Noodles', 'Taman Jurong Food Centre', FALSE, FALSE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user44@example.com')),
('Teck Kee Tanglin Pau', 'Woodlands 888 Plaza', TRUE, TRUE, '10:00:00', '22:00:00', (SELECT id FROM auth.users WHERE email = 'user45@example.com'));

-- Insert favourite records
INSERT INTO favourite (foodie_id, hawker_id, date)
VALUES
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user1@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user6@example.com')), '2023-09-01'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user1@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com')), '2023-09-02'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user2@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')), '2023-09-03'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user3@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user8@example.com')), '2023-09-04'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user4@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user10@example.com')), '2023-09-05'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user5@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com')), '2023-09-06'),
    ((SELECT id FROM foodie WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user5@example.com')), 
     (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user8@example.com')), '2023-09-07');

-- Insert food table (specific food items for each hawker)
INSERT INTO food (name, hawker_id)
VALUES
('Hainanese Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user6@example.com'))),
('Spicy Chicken Curry', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com'))),
('Satay Skewers', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user8@example.com'))),
('Tom Yum Noodles', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com'))),
('Pad Kra Pao', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com'))),
('Tonkotsu Ramen', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user10@example.com'))),
('Hainanese Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user11@example.com'))),
('Roast Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user11@example.com'))),
('Char Kway Teow', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user12@example.com'))),
('Fried Hokkien Mee', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user12@example.com'))),
('Murtabak', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user13@example.com'))),
('Nasi Briyani', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user13@example.com'))),
('Steamed Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user14@example.com'))),
('Laksa', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user15@example.com'))),
('Curry Puff', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user16@example.com'))),
('Curry Chicken Noodles', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user17@example.com'))),
('Fried Kway Teow', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user18@example.com'))),
('Steamed Pork Pau', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user19@example.com'))),
('Fried Hokkien Mee', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user20@example.com'))),
('Nasi Lemak', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user21@example.com'))),
('Fried Kway Teow', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user22@example.com'))),
('Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user23@example.com'))),
('Nasi Lemak', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user24@example.com'))),
('Seafood Soup', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user25@example.com'))),
('Wanton Mee', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user26@example.com'))),
('Bak Kut Teh', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user27@example.com'))),
('Hainanese Curry Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user28@example.com'))),
('Satay', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user29@example.com'))),
('Char Kway Teow', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user30@example.com'))),
('Singapore Noodle', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user31@example.com'))),
('Soy Sauce Chicken', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user32@example.com'))),
('Laksa', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user33@example.com'))),
('Hainanese Chicken Rice', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user34@example.com'))),
('Fish Soup', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user35@example.com'))),
('Hokkien Mee', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user36@example.com'))),
('Mango Sago', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user37@example.com'))),
('Xiao Long Bao', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user38@example.com'))),
('Fried Oyster Omelette', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user39@example.com'))),
('Carrot Cake', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user40@example.com'))),
('Lor Mee', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user41@example.com'))),
('Big Prawn Noodles', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user42@example.com'))),
('Cockle Fried Kway Teow', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user43@example.com'))),
('Wanton Noodles', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user44@example.com'))),
('Steamed Pau', 
    (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user45@example.com')));

-- -- Insert hawker and their respective food items in sequence
-- -- Hainan Delights and its food
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('Hainan Delights', 'Chinese', '335 Smith St, #02-50 Chinatown Complex, Singapore 050335', FALSE, FALSE, '10:00:00', '20:00:00',  (SELECT id FROM auth.users WHERE email = 'user6@example.com'));

-- INSERT INTO food (name, hawker_id)
-- VALUES
-- ('Hainanese Chicken Rice', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user6@example.com')));

-- -- Spice Haven and its food
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('Spice Haven', 'Indian', '49 Serangoon Road, Singapore 217990', FALSE, TRUE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user7@example.com'));

-- INSERT INTO food (name, hawker_id)
-- VALUES
-- ('Spicy Chicken Curry', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com')));

-- -- Satay King and its food
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('Satay King', 'Malay', '14 Scotts Road, Far East Plaza #05-99, Singapore 228213', TRUE, FALSE, '12:00:00', '00:00:00', (SELECT id FROM auth.users WHERE email = 'user8@example.com'));

-- INSERT INTO food (name, hawker_id)
-- VALUES
-- ('Satay Skewers', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user8@example.com')));

-- -- Noodle Paradise and its food
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('Noodle Paradise', 'Thai', '470 North Bridge Road, Bugis Cube, #01-06, Singapore 188735', FALSE, TRUE, '10:00:00', '07:00:00', (SELECT id FROM auth.users WHERE email = 'user9@example.com'));

-- INSERT INTO food (name, hawker_id)
-- VALUES
-- ('Tom Yum Noodles', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com'))),
-- ('Pad Kra Pao', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')));

-- -- The Ramen Shop and its food
-- INSERT INTO hawker (name, cuisine, location, halal, vegetarian, opening, closing, user_id)
-- VALUES
-- ('The Ramen Shop', 'Japanese', '7 Tanjong Pagar Plaza, #02-104, Singapore 081007', FALSE, FALSE, '10:00:00', '20:00:00', (SELECT id FROM auth.users WHERE email = 'user10@example.com'));

-- INSERT INTO food (name, hawker_id)
-- VALUES
-- ('Tonkotsu Ramen', (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user10@example.com')));



-- Insert search table (foodies search for food)
INSERT INTO search (text, date, foodie_id)
VALUES
('Recommend me something spicy near my location', '2023-09-01', 1),
('Recommend me something soupy and does not contain fish', '2023-09-02', 2),
('Show me vegetarian options in Chinatown', '2023-09-03', 3),
('Find me a Thai dish near Bugis', '2023-09-04', 4),
('Recommend me something spicy and non-vegetarian', '2023-09-05', 5);

-- Insert results table (each search has 1-3 results)
-- Search 1: "Recommend me something spicy near my location"
INSERT INTO results (search_id, hawker_id, reason)
VALUES
(1, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com')), 'Spicy Chicken Curry is highly recommended for spice lovers'),
(1, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')), 'Tom Yum Noodles has a spicy kick with Thai flavors');

-- Search 2: "Recommend me something soupy and does not contain fish"
INSERT INTO results (search_id, hawker_id, reason)
VALUES
(2, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user10@example.com')), 'Tonkotsu Ramen is a soupy dish without fish'),
(2, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')), 'Tom Yum Noodles offers a soupy option without fish');

-- Search 3: "Show me vegetarian options in Chinatown"
INSERT INTO results (search_id, hawker_id, reason)
VALUES
(3, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user6@example.com')), 'Hainanese Chicken Rice can be adapted for vegetarians'),
(3, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')), 'Tom Yum Noodles offers vegetarian-friendly options');

-- Search 4: "Find me a Thai dish near Bugis"
INSERT INTO results (search_id, hawker_id, reason)
VALUES
(4, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user9@example.com')), 'Tom Yum Noodles is a top-rated Thai dish near Bugis');

-- Search 5: "Recommend me something spicy and non-vegetarian"
INSERT INTO results (search_id, hawker_id, reason)
VALUES
(5, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user7@example.com')), 'Spicy Chicken Curry satisfies your spicy and non-vegetarian criteria'),
(5, (SELECT id FROM hawker WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user8@example.com')), 'Satay Skewers are a great spicy non-vegetarian option');
