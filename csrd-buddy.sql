--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: emission_factors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.emission_factors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    subcategory text,
    scope integer NOT NULL,
    factor numeric(10,6) NOT NULL,
    unit text NOT NULL,
    source text NOT NULL,
    year integer NOT NULL,
    description text
);


ALTER TABLE public.emission_factors OWNER TO neondb_owner;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reports (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    title text NOT NULL,
    period text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    total_emissions numeric(10,3) NOT NULL,
    scope1_emissions numeric(10,3) NOT NULL,
    scope2_emissions numeric(10,3) NOT NULL,
    scope3_emissions numeric(10,3) NOT NULL,
    status text DEFAULT 'generating'::text NOT NULL,
    pdf_path text,
    xbrl_path text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reports OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    upload_id character varying NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp without time zone NOT NULL,
    category text,
    scope integer,
    emissions_factor numeric(10,6),
    co2_emissions numeric(10,3),
    ai_classified boolean DEFAULT false,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: uploads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.uploads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    filename text NOT NULL,
    file_size integer NOT NULL,
    status text DEFAULT 'processing'::text NOT NULL,
    processed_rows integer DEFAULT 0,
    total_rows integer DEFAULT 0,
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.uploads OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    company_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: emission_factors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.emission_factors (id, category, subcategory, scope, factor, unit, source, year, description) FROM stdin;
1b0a37bd-b230-4932-bf0d-36d490edc926	Fuel	Diesel	1	2.687000	kg CO2e per litre	DEFRA 2024	2024	Default fuel emission factor
eac57e22-58e5-482b-91aa-fe10a737a117	Fuel	Petrol	1	2.315000	kg CO2e per litre	DEFRA 2024	2024	Default fuel emission factor
5405a208-2f35-440f-bbad-d71107167920	Electricity	Uk	2	0.193000	kg CO2e per kWh	DEFRA 2024	2024	Default electricity emission factor
42bca665-cf62-4ad3-8d4f-849a5255a1c8	Natural	Gas	2	0.184000	kg CO2e per kWh	DEFRA 2024	2024	Default natural emission factor
e1005c96-bb51-4863-8ef4-33809d464c91	Flight	Domestic	3	0.255000	kg CO2e per km	DEFRA 2024	2024	Default flight emission factor
c87993b5-9f51-4bb7-9b7c-235e02f285c7	Flight	International	3	0.195000	kg CO2e per km	DEFRA 2024	2024	Default flight emission factor
23dab22c-1cbf-468b-956a-7097e514ca76	Hotel	Night	3	24.300000	kg CO2e per night	DEFRA 2024	2024	Default hotel emission factor
27d3b0a2-889c-4274-93c4-ed703e87a8f2	Taxi	Km	3	0.211000	kg CO2e per km	DEFRA 2024	2024	Default taxi emission factor
3e14fb8a-1e66-4743-882f-32a0561725d7	Office	Supplies	3	0.500000	kg CO2e per €	DEFRA 2024	2024	Default office emission factor
f5b3818c-0d00-477f-bcfa-87611adff08c	Consulting	Services	3	0.100000	kg CO2e per €	DEFRA 2024	2024	Default consulting emission factor
3570610b-f14d-46c5-8c43-44c3a28c8083	Waste	General	3	0.475000	kg CO2e per kg	DEFRA 2024	2024	Default waste emission factor
67ca98b1-665a-4c1f-9137-19bef921c8c7	Unknown	\N	3	0.500000	kg CO2e per €	DEFRA 2024	2024	Default factor for Unknown
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reports (id, user_id, title, period, start_date, end_date, total_emissions, scope1_emissions, scope2_emissions, scope3_emissions, status, pdf_path, xbrl_path, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, user_id, upload_id, description, amount, date, category, scope, emissions_factor, co2_emissions, ai_classified, verified, created_at) FROM stdin;
fb4a2a56-7927-4968-aad6-53b235775155	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Shell Fuel Station - Diesel	89.50	2024-01-15 00:00:00	Fuel and Energy	1	0.500000	206.745	t	f	2025-07-29 09:15:55.892945
88979177-8e77-4bb3-ba77-965dec9d58ac	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	BP Fuel Station - Petrol	72.40	2024-02-15 00:00:00	Fuel and Energy	1	0.500000	167.244	t	f	2025-07-29 09:15:55.892945
7a663657-19b0-48fa-ad48-bd23983c6544	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Total Fuel Station	95.80	2024-04-01 00:00:00	Fuel and Energy	1	0.500000	221.298	t	f	2025-07-29 09:15:55.892945
eb0f26c1-080e-407a-ba69-f558e5bb453c	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	British Gas - Office Heating	245.30	2024-01-16 00:00:00	Energy	2	0.500000	47.588	t	f	2025-07-29 09:15:55.892945
f2bc70b8-759c-46ea-85e9-3204dd75b153	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Enel Energia - Electricity Bill	178.90	2024-02-01 00:00:00	Energy	2	0.500000	34.707	t	f	2025-07-29 09:15:55.892945
b6411437-a562-4abb-a635-ec546409812e	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	EDF Energy - Electricity	198.50	2024-03-01 00:00:00	Energy	2	0.500000	38.509	t	f	2025-07-29 09:15:55.892945
b3b986d0-b830-4190-8c4f-fb5c971091af	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	SSE Energy - Gas Bill	165.20	2024-04-05 00:00:00	Energy	2	0.500000	32.049	t	f	2025-07-29 09:15:55.892945
4364d60e-5e97-4bf2-8ba0-5a6599f84e1a	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Ryanair Flight London-Milan	156.80	2024-01-20 00:00:00	Business Travel	3	0.500000	39.984	t	f	2025-07-29 09:15:55.892945
ffc3c1a7-635f-49d6-b5ab-a7efeea0248d	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Hilton Hotel Milan - Business Trip	320.00	2024-01-22 00:00:00	Business Travel	3	0.500000	81.600	t	f	2025-07-29 09:15:55.892945
af4a790f-c868-4b9a-b218-be9e24328af8	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Uber Business Trip	28.50	2024-02-05 00:00:00	Business Travel	3	0.500000	7.268	t	f	2025-07-29 09:15:55.892945
0f797ac9-822a-4878-b33f-99c96124f7d6	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Eurostar London-Paris	185.60	2024-03-05 00:00:00	Business Travel	3	0.500000	47.328	t	f	2025-07-29 09:15:55.892945
3c4742fd-09b0-41db-a6ec-41f890eda691	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Marriott Hotel Paris	280.00	2024-03-10 00:00:00	Business Travel	3	0.500000	71.400	t	f	2025-07-29 09:15:55.892945
8c45ae32-5bc5-4ebc-b977-e9bd90fce20e	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Lufthansa Flight Paris-Berlin	210.40	2024-04-10 00:00:00	Business Travel	3	0.500000	53.652	t	f	2025-07-29 09:15:55.892945
78f2bed3-07ad-4a37-a228-1eb97c97666c	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Microsoft Office 365 Subscription	89.99	2024-02-10 00:00:00	Purchased Services	3	0.500000	4.589	t	f	2025-07-29 09:15:55.892945
eeeba283-d9a6-49a2-98f7-5b1fce4cf812	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Google Workspace	78.00	2024-03-20 00:00:00	Purchased Services	3	0.500000	3.978	t	f	2025-07-29 09:15:55.892945
31f0bbea-da0d-411b-b427-223b08c65158	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Office Depot - Printing Paper	45.20	2024-01-25 00:00:00	Other Services	3	0.500000	4.520	t	t	2025-07-29 09:15:55.892945
335013f9-37b3-405c-809a-0fbf9fd8f0f8	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Amazon Web Services	156.75	2024-02-20 00:00:00	Other Services	3	0.500000	15.675	t	t	2025-07-29 09:15:55.892945
0f823225-d636-4a7f-8af0-6d5821fe08c7	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	WeWork Office Space Rental	890.00	2024-02-25 00:00:00	Other Services	3	0.500000	89.000	t	t	2025-07-29 09:15:55.892945
e860b086-6d70-405a-817c-108529bb3d6b	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	DHL Express Shipping	32.80	2024-03-15 00:00:00	Other Services	3	0.500000	3.280	t	t	2025-07-29 09:15:55.892945
40033838-9059-4ae7-b82c-99869003fbaa	demo-user-id	c8a471fb-47f6-4d01-96be-970fc735afbc	Waste Management Services	125.40	2024-03-25 00:00:00	Other Services	3	0.500000	12.540	t	t	2025-07-29 09:15:55.892945
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.uploads (id, user_id, filename, file_size, status, processed_rows, total_rows, error_message, created_at, completed_at) FROM stdin;
c8a471fb-47f6-4d01-96be-970fc735afbc	demo-user-id	sample-expenses.csv	885	completed	20	20	\N	2025-07-29 09:15:47.170366	2025-07-29 09:15:55.952
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, email, company_name, created_at) FROM stdin;
demo-user-id	demo-user	demo-password	demo@example.com	Demo Company	2025-07-29 09:14:58.693059
\.


--
-- Name: emission_factors emission_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.emission_factors
    ADD CONSTRAINT emission_factors_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: uploads uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: reports reports_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_upload_id_uploads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_upload_id_uploads_id_fk FOREIGN KEY (upload_id) REFERENCES public.uploads(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: uploads uploads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

