CREATE schema private;

create extension if not exists pg_net with schema extensions;
create extension if not exists vector with schema extensions;

CREATE TABLE foodie ( 
    id bigint primary key generated always as identity,
    favourites_count INT not null DEFAULT 0,
    user_id uuid not null references auth.users (id) DEFAULT auth.uid()
);


CREATE TABLE hawker ( 
    id bigint not null primary key generated ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    halal BOOLEAN NOT NULL,
    vegetarian BOOLEAN NOT NULL,
    opening time not NULL,
    closing time not NULL,
    user_id uuid not null references auth.users (id) DEFAULT auth.uid()
);

CREATE TABLE favourite ( 
    foodie_id bigint not null references foodie(id),
    hawker_id bigint not null references hawker(id),
    date DATE,
    PRIMARY KEY (foodie_id, hawker_id)
);

CREATE TABLE food ( 
    id bigint not null PRIMARY key generated ALWAYS AS IDENTITY,
    name VARCHAR(255) not null,
    description VARCHAR(255),
    ingredients VARCHAR(255),
    hawker_id bigint not null references hawker(id)
);

CREATE TABLE search ( 
    id bigint not null PRIMARY key generated ALWAYS AS Identity,
    text VARCHAR(255),
    date DATE,
    foodie_id bigint not null references foodie(id)
);

CREATE TABLE results ( 
    search_id bigint not null references search(id) ,
    hawker_id bigint not NULL references hawker(id),
    reason VARCHAR(255),
    PRIMARY KEY (search_id, hawker_id)
);

CREATE TABLE hawker_embed (
    id bigint primary key generated always as identity,
    hawker_id bigint not null references hawker(id)
        on delete cascade,
    content text not null,
    embedding vector (1536)
);

create index on hawker_embed using hnsw (embedding vector_ip_ops);
