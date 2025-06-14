PGDMP  5    9                }            pizza    17.3    17.3 a    m           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            n           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            o           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            p           1262    16388    pizza    DATABASE     k   CREATE DATABASE pizza WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'ru-RU';
    DROP DATABASE pizza;
                     postgres    false                        3079    16557    pgcrypto 	   EXTENSION     <   CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
    DROP EXTENSION pgcrypto;
                        false            q           0    0    EXTENSION pgcrypto    COMMENT     <   COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
                             false    2                        3079    16595 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                        false            r           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                             false    3            �            1255    16389    calculate_discounted_price()    FUNCTION     �  CREATE FUNCTION public.calculate_discounted_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
discount DECIMAL(10, 2) := 0;
pizza_record RECORD;
total DECIMAL(10, 2) := 0;
current_order_id INT;
BEGIN
-- Получаем order_id из новой записи Ordered_Pizzas
current_order_id := NEW.order_id;
RAISE NOTICE 'Calculating total price for order ID: %', current_order_id;

-- Собираем все пиццы в заказе
FOR pizza_record IN
    SELECT p.id AS pizza_id, p.name AS pizza_name, p.cost_price, op.quantity
    FROM Ordered_Pizzas op
    JOIN Pizzas p ON op.pizza_id = p.id
    WHERE op.order_id = current_order_id
LOOP
    -- Находим действующую скидку для этой пиццы
    SELECT COALESCE(SUM(discount_amount), 0) INTO discount
    FROM Promotions
    WHERE conditions = pizza_record.pizza_name
      AND NOW() BETWEEN start_date AND end_date;

    -- Применяем скидку к каждой единице пиццы
    total := total + (pizza_record.cost_price - discount) * pizza_record.quantity;
END LOOP;

-- Обновляем общую сумму заказа
UPDATE Orders SET total_price = total WHERE id = current_order_id;

RETURN NEW;
END;
$$;
 3   DROP FUNCTION public.calculate_discounted_price();
       public               postgres    false            �            1255    16390    calculate_total_price()    FUNCTION     �  CREATE FUNCTION public.calculate_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
NEW.total_price := (
SELECT SUM((m.price - COALESCE(p.discount_amount, 0)) * op.quantity)
FROM ordered_pizzas op
JOIN pizzas pz ON op.pizza_id = pz.id
JOIN menu m ON pz.id = m.pizza_id
LEFT JOIN promotions p ON pz.name = p.promotion_name
AND CURRENT_TIMESTAMP BETWEEN p.start_date AND p.end_date
WHERE op.order_id = NEW.id
);
RETURN NEW;
END;
$$;
 .   DROP FUNCTION public.calculate_total_price();
       public               postgres    false                       1255    16535    update_menu_price_from_pizzas()    FUNCTION     �   CREATE FUNCTION public.update_menu_price_from_pizzas() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE menu
    SET price = NEW.cost_price * 1.3
    WHERE pizza_id = NEW.id;
    RETURN NEW;
END;
$$;
 6   DROP FUNCTION public.update_menu_price_from_pizzas();
       public               postgres    false            0           1255    16537    update_menu_total_price()    FUNCTION     &  CREATE FUNCTION public.update_menu_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Обновляем total_price для пицц с акциями
    UPDATE menu m
    SET total_price = m.price + COALESCE(
        (SELECT SUM(pr.discount_amount)
         FROM promotions pr
         WHERE pr.pizza_id::UUID = m.pizza_id::UUID 
         AND CURRENT_TIMESTAMP BETWEEN pr.start_date AND pr.end_date),
        0
    )
    WHERE m.pizza_id IN (SELECT pizza_id FROM promotions);

    -- Обновляем total_price для пицц без акций
    UPDATE menu m
    SET total_price = m.price
    WHERE m.pizza_id::UUID NOT IN (
        SELECT pizza_id::UUID FROM promotions 
        WHERE CURRENT_TIMESTAMP BETWEEN start_date AND end_date
    );
    
    RETURN NEW;
END;
$$;
 0   DROP FUNCTION public.update_menu_total_price();
       public               postgres    false            
           1255    16392    update_order_total()    FUNCTION     �  CREATE FUNCTION public.update_order_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Обновляем total_price в заказе при изменении ordered_pizzas
    UPDATE orders
    SET total_price = (
        SELECT SUM(op.quantity * (m.price - COALESCE(p.discount_amount, 0)))
        FROM ordered_pizzas op
        JOIN pizzas pz ON op.pizza_id = pz.id
        JOIN menu m ON pz.id = m.pizza_id
        LEFT JOIN promotions p ON pz.name = p.promotion_name
            AND orders.delivery_date BETWEEN p.start_date AND p.end_date
        WHERE op.order_id = orders.id
    )
    WHERE id = NEW.order_id; -- NEW.order_id доступен при вставке в ordered_pizzas
    RETURN NEW;
END;
$$;
 +   DROP FUNCTION public.update_order_total();
       public               postgres    false                       1255    16393    update_order_total_price()    FUNCTION     v  CREATE FUNCTION public.update_order_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    order_id_val INTEGER;
BEGIN
    -- Определить ID заказа для обновления
    IF (TG_OP = 'DELETE') THEN
        order_id_val := OLD.order_id;
    ELSE
        order_id_val := NEW.order_id;
    END IF;

    -- Пересчитать total_price для заказа
    UPDATE orders
    SET total_price = (
        SELECT SUM((m.price - COALESCE(p.discount_amount, 0)) * op.quantity)
        FROM ordered_pizzas op
        JOIN pizzas pz ON op.pizza_id = pz.id
        JOIN menu m ON pz.id = m.pizza_id
        LEFT JOIN promotions p 
            ON pz.name = p.promotion_name 
            AND CURRENT_TIMESTAMP BETWEEN p.start_date AND p.end_date
        WHERE op.order_id = order_id_val
    )
    WHERE id = order_id_val;

    RETURN NULL;
END;
$$;
 1   DROP FUNCTION public.update_order_total_price();
       public               postgres    false            �            1259    16540    __EFMigrationsHistory    TABLE     �   CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);
 +   DROP TABLE public."__EFMigrationsHistory";
       public         heap r       postgres    false            �            1259    16394    couriers    TABLE     :  CREATE TABLE public.couriers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    contact_info character varying(100),
    max_capacity integer NOT NULL,
    password_hash character varying(255),
    salt character varying(255),
    role character varying(50)
);
    DROP TABLE public.couriers;
       public         heap r       postgres    false    3            �            1259    16397    couriers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.couriers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.couriers_id_seq;
       public               postgres    false    219            s           0    0    couriers_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.couriers_id_seq OWNED BY public.couriers.id;
          public               postgres    false    220            �            1259    16398 	   customers    TABLE       CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    contact_info character varying(100),
    password_hash character varying(255),
    salt character varying(255),
    role character varying(50)
);
    DROP TABLE public.customers;
       public         heap r       postgres    false    3            �            1259    16401    customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.customers_id_seq;
       public               postgres    false    221            t           0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
          public               postgres    false    222            �            1259    16402    delivery_operations    TABLE        CREATE TABLE public.delivery_operations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    delivery_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    courier_id uuid,
    order_id uuid,
    status character varying(50)
);
 '   DROP TABLE public.delivery_operations;
       public         heap r       postgres    false    3            �            1259    16406    delivery_operations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.delivery_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.delivery_operations_id_seq;
       public               postgres    false    223            u           0    0    delivery_operations_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.delivery_operations_id_seq OWNED BY public.delivery_operations.id;
          public               postgres    false    224            �            1259    16407 	   employees    TABLE     >  CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    contact_info character varying(100),
    "position" character varying(50),
    password_hash character varying(255),
    salt character varying(255),
    role character varying(50)
);
    DROP TABLE public.employees;
       public         heap r       postgres    false    3            �            1259    16410    employees_id_seq    SEQUENCE     �   CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.employees_id_seq;
       public               postgres    false    225            v           0    0    employees_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;
          public               postgres    false    226            �            1259    16411    menu    TABLE     �   CREATE TABLE public.menu (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pizza_id uuid,
    price numeric(10,2) NOT NULL,
    total_price numeric(10,2)
);
    DROP TABLE public.menu;
       public         heap r       postgres    false    3            �            1259    16414    menu_id_seq    SEQUENCE     �   CREATE SEQUENCE public.menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.menu_id_seq;
       public               postgres    false    227            w           0    0    menu_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.menu_id_seq OWNED BY public.menu.id;
          public               postgres    false    228            �            1259    16415    ordered_pizzas    TABLE     �   CREATE TABLE public.ordered_pizzas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    pizza_id uuid,
    quantity integer NOT NULL
);
 "   DROP TABLE public.ordered_pizzas;
       public         heap r       postgres    false    3            �            1259    16418    ordered_pizzas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ordered_pizzas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.ordered_pizzas_id_seq;
       public               postgres    false    229            x           0    0    ordered_pizzas_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.ordered_pizzas_id_seq OWNED BY public.ordered_pizzas.id;
          public               postgres    false    230            �            1259    16419    orders    TABLE     !  CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(50),
    customer_id uuid,
    delivery_address character varying(255),
    employee_id uuid
);
    DROP TABLE public.orders;
       public         heap r       postgres    false    3            �            1259    16423    orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.orders_id_seq;
       public               postgres    false    231            y           0    0    orders_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
          public               postgres    false    232            �            1259    16424    pizzas    TABLE     �   CREATE TABLE public.pizzas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    ingredients text,
    cost_price numeric(10,2) NOT NULL,
    image character varying(200)
);
    DROP TABLE public.pizzas;
       public         heap r       postgres    false    3            �            1259    16429    pizzas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.pizzas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.pizzas_id_seq;
       public               postgres    false    233            z           0    0    pizzas_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.pizzas_id_seq OWNED BY public.pizzas.id;
          public               postgres    false    234            �            1259    16430 
   promotions    TABLE     B  CREATE TABLE public.promotions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    promotion_name character varying(100) NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    conditions text,
    discount_amount numeric(10,2),
    pizza_id uuid
);
    DROP TABLE public.promotions;
       public         heap r       postgres    false    3            �            1259    16435    promotions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.promotions_id_seq;
       public               postgres    false    235            {           0    0    promotions_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;
          public               postgres    false    236            �            1259    16436    reviews    TABLE     J  CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    review_text text,
    rating integer,
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id uuid,
    order_id uuid,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
    DROP TABLE public.reviews;
       public         heap r       postgres    false    3            �            1259    16443    reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reviews_id_seq;
       public               postgres    false    237            |           0    0    reviews_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
          public               postgres    false    238            �            1259    16444    sales_statistics    TABLE     5  CREATE TABLE public.sales_statistics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sale_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_id uuid,
    order_amount numeric(10,2) NOT NULL,
    cost_price numeric(10,2) NOT NULL,
    profit numeric(10,2) NOT NULL
);
 $   DROP TABLE public.sales_statistics;
       public         heap r       postgres    false    3            �            1259    16448    sales_statistics_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sales_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.sales_statistics_id_seq;
       public               postgres    false    239            }           0    0    sales_statistics_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.sales_statistics_id_seq OWNED BY public.sales_statistics.id;
          public               postgres    false    240            j          0    16540    __EFMigrationsHistory 
   TABLE DATA           R   COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
    public               postgres    false    241   ��       T          0    16394    couriers 
   TABLE DATA           c   COPY public.couriers (id, name, contact_info, max_capacity, password_hash, salt, role) FROM stdin;
    public               postgres    false    219   ��       V          0    16398 	   customers 
   TABLE DATA           V   COPY public.customers (id, name, contact_info, password_hash, salt, role) FROM stdin;
    public               postgres    false    221   ߃       X          0    16402    delivery_operations 
   TABLE DATA           ^   COPY public.delivery_operations (id, delivery_date, courier_id, order_id, status) FROM stdin;
    public               postgres    false    223   ��       Z          0    16407 	   employees 
   TABLE DATA           b   COPY public.employees (id, name, contact_info, "position", password_hash, salt, role) FROM stdin;
    public               postgres    false    225   ��       \          0    16411    menu 
   TABLE DATA           @   COPY public.menu (id, pizza_id, price, total_price) FROM stdin;
    public               postgres    false    227   ��       ^          0    16415    ordered_pizzas 
   TABLE DATA           J   COPY public.ordered_pizzas (id, order_id, pizza_id, quantity) FROM stdin;
    public               postgres    false    229   ��       `          0    16419    orders 
   TABLE DATA           d   COPY public.orders (id, order_date, status, customer_id, delivery_address, employee_id) FROM stdin;
    public               postgres    false    231   e�       b          0    16424    pizzas 
   TABLE DATA           J   COPY public.pizzas (id, name, ingredients, cost_price, image) FROM stdin;
    public               postgres    false    233   Џ       d          0    16430 
   promotions 
   TABLE DATA           u   COPY public.promotions (id, promotion_name, start_date, end_date, conditions, discount_amount, pizza_id) FROM stdin;
    public               postgres    false    235   ��       f          0    16436    reviews 
   TABLE DATA           ^   COPY public.reviews (id, review_text, rating, review_date, customer_id, order_id) FROM stdin;
    public               postgres    false    237   ��       h          0    16444    sales_statistics 
   TABLE DATA           e   COPY public.sales_statistics (id, sale_date, order_id, order_amount, cost_price, profit) FROM stdin;
    public               postgres    false    239   e�       ~           0    0    couriers_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.couriers_id_seq', 6, true);
          public               postgres    false    220                       0    0    customers_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.customers_id_seq', 5, true);
          public               postgres    false    222            �           0    0    delivery_operations_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.delivery_operations_id_seq', 6, true);
          public               postgres    false    224            �           0    0    employees_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.employees_id_seq', 4, true);
          public               postgres    false    226            �           0    0    menu_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.menu_id_seq', 5, true);
          public               postgres    false    228            �           0    0    ordered_pizzas_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.ordered_pizzas_id_seq', 16, true);
          public               postgres    false    230            �           0    0    orders_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.orders_id_seq', 24, true);
          public               postgres    false    232            �           0    0    pizzas_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.pizzas_id_seq', 8, true);
          public               postgres    false    234            �           0    0    promotions_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.promotions_id_seq', 3, true);
          public               postgres    false    236            �           0    0    reviews_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.reviews_id_seq', 4, true);
          public               postgres    false    238            �           0    0    sales_statistics_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.sales_statistics_id_seq', 3, true);
          public               postgres    false    240            �           2606    16544 .   __EFMigrationsHistory PK___EFMigrationsHistory 
   CONSTRAINT     {   ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");
 \   ALTER TABLE ONLY public."__EFMigrationsHistory" DROP CONSTRAINT "PK___EFMigrationsHistory";
       public                 postgres    false    241            �           2606    16609    couriers couriers_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.couriers
    ADD CONSTRAINT couriers_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.couriers DROP CONSTRAINT couriers_pkey;
       public                 postgres    false    219            �           2606    16632    customers customers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
       public                 postgres    false    221            �           2606    16653 ,   delivery_operations delivery_operations_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.delivery_operations
    ADD CONSTRAINT delivery_operations_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.delivery_operations DROP CONSTRAINT delivery_operations_pkey;
       public                 postgres    false    223            �           2606    16646    employees employees_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public                 postgres    false    225            �           2606    16661    menu menu_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.menu DROP CONSTRAINT menu_pkey;
       public                 postgres    false    227            �           2606    16668 "   ordered_pizzas ordered_pizzas_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.ordered_pizzas
    ADD CONSTRAINT ordered_pizzas_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.ordered_pizzas DROP CONSTRAINT ordered_pizzas_pkey;
       public                 postgres    false    229            �           2606    16616    orders orders_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
       public                 postgres    false    231            �           2606    16853    pizzas pizzas_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.pizzas
    ADD CONSTRAINT pizzas_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.pizzas DROP CONSTRAINT pizzas_pkey;
       public                 postgres    false    233            �           2606    16684    promotions promotions_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.promotions DROP CONSTRAINT promotions_pkey;
       public                 postgres    false    235            �           2606    16693    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public                 postgres    false    237            �           2606    16702 &   sales_statistics sales_statistics_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sales_statistics
    ADD CONSTRAINT sales_statistics_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.sales_statistics DROP CONSTRAINT sales_statistics_pkey;
       public                 postgres    false    239            �           1259    16714    ix_delivery_operations_order_id    INDEX     j   CREATE UNIQUE INDEX ix_delivery_operations_order_id ON public.delivery_operations USING btree (order_id);
 3   DROP INDEX public.ix_delivery_operations_order_id;
       public                 postgres    false    223            �           2620    16822    menu trg_menu_total_price    TRIGGER     �   CREATE TRIGGER trg_menu_total_price AFTER UPDATE OF price ON public.menu FOR EACH STATEMENT EXECUTE FUNCTION public.update_menu_total_price();
 2   DROP TRIGGER trg_menu_total_price ON public.menu;
       public               postgres    false    227    304    227            �           2620    16536    pizzas trg_pizzas_update    TRIGGER     �   CREATE TRIGGER trg_pizzas_update AFTER UPDATE OF cost_price ON public.pizzas FOR EACH ROW EXECUTE FUNCTION public.update_menu_price_from_pizzas();
 1   DROP TRIGGER trg_pizzas_update ON public.pizzas;
       public               postgres    false    233    271    233            �           2620    16821 %   promotions trg_promotions_total_price    TRIGGER     �   CREATE TRIGGER trg_promotions_total_price AFTER INSERT OR DELETE OR UPDATE ON public.promotions FOR EACH STATEMENT EXECUTE FUNCTION public.update_menu_total_price();
 >   DROP TRIGGER trg_promotions_total_price ON public.promotions;
       public               postgres    false    235    304            �           2606    16735 7   delivery_operations delivery_operations_courier_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.delivery_operations
    ADD CONSTRAINT delivery_operations_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id);
 a   ALTER TABLE ONLY public.delivery_operations DROP CONSTRAINT delivery_operations_courier_id_fkey;
       public               postgres    false    223    4766    219            �           2606    16740 5   delivery_operations delivery_operations_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.delivery_operations
    ADD CONSTRAINT delivery_operations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
 _   ALTER TABLE ONLY public.delivery_operations DROP CONSTRAINT delivery_operations_order_id_fkey;
       public               postgres    false    223    4779    231            �           2606    16854    menu menu_pizza_id_fkey    FK CONSTRAINT     x   ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pizza_id_fkey FOREIGN KEY (pizza_id) REFERENCES public.pizzas(id);
 A   ALTER TABLE ONLY public.menu DROP CONSTRAINT menu_pizza_id_fkey;
       public               postgres    false    4781    227    233            �           2606    16767 +   ordered_pizzas ordered_pizzas_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ordered_pizzas
    ADD CONSTRAINT ordered_pizzas_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
 U   ALTER TABLE ONLY public.ordered_pizzas DROP CONSTRAINT ordered_pizzas_order_id_fkey;
       public               postgres    false    231    4779    229            �           2606    16859 +   ordered_pizzas ordered_pizzas_pizza_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ordered_pizzas
    ADD CONSTRAINT ordered_pizzas_pizza_id_fkey FOREIGN KEY (pizza_id) REFERENCES public.pizzas(id);
 U   ALTER TABLE ONLY public.ordered_pizzas DROP CONSTRAINT ordered_pizzas_pizza_id_fkey;
       public               postgres    false    229    4781    233            �           2606    16785    orders orders_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 H   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_customer_id_fkey;
       public               postgres    false    221    231    4768            �           2606    16780    orders orders_employee_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);
 H   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_employee_id_fkey;
       public               postgres    false    225    4773    231            �           2606    16807     reviews reviews_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 J   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_customer_id_fkey;
       public               postgres    false    221    4768    237            �           2606    16802    reviews reviews_order_id_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
 G   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_order_id_fkey;
       public               postgres    false    4779    231    237            �           2606    16816 /   sales_statistics sales_statistics_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sales_statistics
    ADD CONSTRAINT sales_statistics_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
 Y   ALTER TABLE ONLY public.sales_statistics DROP CONSTRAINT sales_statistics_order_id_fkey;
       public               postgres    false    231    4779    239            j      x������ � �      T   "  x�m��N�0  �sy
�[�ʁD73�Mt�"3^��:����%^} �S�%&&F������a_��G���s(�eAl;)�����B�H ��^�^����V?׻�E}�;����r�r�ZdbQ�OŖ��S���`�Y��r��AX��;:��}:%����Q7�\ķU>�@���]2J��
�e3�?�<�.��e�H"�RCBl2.�#!a"C����U}��Ô�5m��k��Yr��qZ�w���I�5�;�[�0I��D���=0I�$kmX{){%���CCӴ_^a}G      V   �  x�uпN�@ ������Q��b�K�@M\j$�.w����o��$��v��Ą��*�-}��5t�J�~�M}3�J*�$ܰ�ӳ	4l,�B��#	�_���{{����ˆ�ַ�F�ҏ���+����l3)s`�͘����Ӄ�����������A�%j��[�]v�=M]�����c'\�~��CZO�����n�\^tx����9AHUbC�ll
.)(��֒�5�i?�;����xv><A��*�y��m�%˫L�5oL�_d15�0�{�F"o2�Ib_�n�V���(��q���tD��"��͏�S��ssb[R@���Z�d	�Al:�2�)9�1_��c�Q���E/���$K�lTw�$/��qt6d�������b$R�.�ޗ�1�UA\�M���U����n�������w      X      x������ � �      Z   �  x�U��r�@���S��(X>}]�ĉ �(�v��t�Yql�N�$CEe``x�I��y��q6�n�3�������+��d�q*�:�2Q*k�����j"�K����|(n�+x�;D�8L�c�X#�9�,��Uq]�]��`β='j�g.��	IÞS1�Z��^ƕ=Co&����輆����;�vy؍�6k���N��vֿ$�S�`>���d�U�Nd���s�+���rA�,ޗ��dQ��=<m,Vp9r�(�Gt��h��?�[a�$�~�C�(�X�&n��,�ѫ�9햏�(�^x'�rdv≃[�����z<nN�S�&�UC�h83��I������M��qhB|$)s=�cY�]_VM��.�L}jRc�5���FAP���� z\����q:����&�E�n��Y3Uikw�����5^F׊.���qܝ�}\>˦��
X�n�n��H�9��Q�B�Z�|:�\z�%I�_�T�B      \   <  x�-���d!D׾\�
���F��ӯ�M-,�E�u|�B��9\u��18N��٘ԌF�v8���Q��n9�hXk}�^�x���� >:�$b����6���}Ön������Q,1���A�/	[�pe�W�=/C,=#�vk�c.c��z��.اB{L;��X/��'үJ=�$	<(kX�0�,O�?Л�ٶ�L}�*�E�6�8�W���O��H#+@R�+J��"��_�q�c[ҧ�3���2�~@�0v`u������gN��#�s20�{���w..�M�=�zb-�{���}��]ĭ�������<�1��      ^   e  x��V��,�
[�ɅW6`lr��q�!|���������紱J��Hk� ����^#�7�=���p�&N�n$���x����˥�,�*m�C݉c�m�Vo���GJ� �{H�5J9�����ع�O�2��J��PFtګ��w��erU��Pi�ղ����������hU��N����*�p掹:�vIA���&i��־���Wn�Q�� o�k�B��|�F����v�$EUZ}w�S�jT]`hG��,�߾Z|�u]��4�ݟԴad�1�lN�T�,g��V�5��u�iA�շ��֜��O�O���gv/�ڻPk�F�6���ϊ��C�gj�$�*4g�vBNZ{u��# l)�9i��1�<�;�>��)�d<V�)0)����%��r�����c��2�HФ�c&4_#��m��3K�H�:�Æ}çm��&ӗ6
3Lh�HX&X'�B���-u�0Fr���;�]Ǉ��J�co+�a��G��!�.�}�qQA6�o
�+z�n�)o����"]2>D���1�ʲ�P��� �F���jU^��	�$#��ok�ۭ�.�/f!%����k�u����u�k��}�u XK)�wiw�k����h��ͺ�(ȇ�Y���y:5��X�>?1���}.��d8��t蔮畡E���G�΍�A3��1��}D�T�]�1��UHp�8�K���+�)=��p,<v������g�:C�@piץbd���e8��Ó�O������bE�|iq�)[@��m���eo���;8m���F_a̋���������ō�-�]X7 Fi���_�qݲj��t4���3��ԕ�bŞ �￿����V$      `   [  x���Kn�F�ףS� SDwU��x�l�l�9���!rVAû,%Y2�]�y#�zY��Z������/�}�$6��z��8����_�A����3�Yi��bX��M�T/���G�Y���H!a��Y"H���4�1˪�W��~���M=����~�W���tݰ�}|�6ί��w��i���
9Kف�؏b�r9�	�=�D&;���x� &4��ي�$���H��1��Ἥ��~�4���4��t8��(W3�A�������(�0��\��Gʀ}�SN�P��Y�!�XhUO�z�z6�j!�?���*���7z����}�*�^(Ȼi�����E��y)�糗�2�\΀�`C"�zɂY�8�1�G�ciђqnUߨ��N���=�����mSOt���iY�x��IgK�1�p)��ѫ�as�6��*�t����q�jm�n�i=�Q\�˅u�{��\��\��ŭr\O�o,��@��@��RJ֨�Q�VL�Jُl�ȳ�GJ�Y;K�.x�*�w��ff�]�mvx�t����+��X�eL}��$VY����mr��8q���1����V�:�p<�~��רS��K��΀���X�{�<d�,�A�b���#���ƥ97���R y*ܺnnlI��/O�;���U/��_;���ϖQ�{$H��/����`��=��̓�̗0��l�h���=�z���Ѡ��z\��)�N����'#H"�G�{9<��n�-2�6:c囁:��4f�I#_�C?�b��t@k�I~ԽՖ8�u���x���}-�Eϖ��"���`pà>��O|�Fp���9v.��X��-��voo�3I=      b   �  x��TKNA]�O�hO��:g� ,"E��?�qv`$���EvI��l�5�3W�Qj#p����?�]=�ޫn�3��VDZ_�x ��4��2Y�oy���E;k�yZ�y���1���$_�5Gy�7G�8j&���Z>���;��-�M�)�RZ��zo��,�W��aw;�n'��ݝT��T�U���	A�*YrGۏA%��p�h4�zM97������x�O�^�� Ƃ��i����">��3͒*�Y3n��|��?�+��ٜ�+�o�:�Np|�����}�����!�7�6[<d���6���Y�Κ�6�="���]�c�i�A�� �z"�3g7�븧T�X�lD267:��(w�)D� 	h�H%UHa@e?#���'^��|��/�9*�+u6Zh��Sf��4J�h-J^i��0qEf͢+1I/���Zf	w�+j40j���~Xj9G�����_W��K+n����k+��H�Ĩ5V��F�$�ge7� \U�Wxb��D�����h,^,����z��{�^;t���.py��\!Ԋ<��Ճ@\�Gn�����Q��;��x?v�G��H�*�*y0Q��Q���r��~/�:��FLXb]�Dz�q�#��dc��sQ9��Z,����_��_��W�����l��i�-L�0��0�_BLJ��}墎���LP�{���N��[z      d   �   x�m�MN1��3��*N��Y�d�s��J	$ĞMo0*�(�+87"����x��?g�b�l�D�`����Μ)�8&��K}��r��|˫|��i���̵R�Vo\=M��<�ȩ>��޶=[��:m6�iqdF���8��"cD]֜!�MrH{>2X�8QW�D�|ҝ�^�r��A�����K�zw9�?)�!=��y_�Z�ɧ����K��}Gv�vS��@gU����G�(��ȱx��ͦ���\|�      f   �  x���=n1��S���DR?�&I#��ޤ�q�4A��1vs͍�u �\DP!@���Ƞ%���&����@�c�A���0����t�������i���,aA����-���1�D9-Z���sn�AFM�1�o�so��6�!8�H@D�~�&�D{��3��0Q3e�!Q�<J��x�����a��q>���~Hac<�D��T��V G6y��@�X��]X��~�4��|��e^�/lh7��{#QC���D��
<�w���du2:���L�X�`P{m��Z��e~�Y��r>��/~�!�{�_�6��sx(K�2b t���-�C�^�4A�*T���+争�AI΃w=iȹW���Ek�x��^o�8/��_+|ޜQƣ��6��1pDm�6!ۄ�+��ԵBM�[��u��i�z      h      x������ � �     