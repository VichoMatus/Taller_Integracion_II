import psycopg2

def conectar_bd():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
        dbname="prueba",
        user="postgres",    
        password="1591" 
    )

        print("¡Conexión exitosa!")

        # Opcional: consulta rápida
        cur = conn.cursor()
        cur.execute("SELECT version();")
        print(cur.fetchone())
        return conn


    except psycopg2.Error as e:
        print("Error al conectar a la base de datos:")
        print(e)
        return None


def crear_tabla(conn):
    """ Crea la tabla productos si no existe """
    with conn.cursor () as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY ,
            nombre VARCHAR (100) NOT NULL UNIQUE ,
            precio NUMERIC (10, 2) NOT NULL CHECK (precio >=
            0),
            stock INT NOT NULL CHECK (stock >= 0)
            );
            """)
    conn.commit ()
    print("Tabla ’productos ’ verificada/creada.")

#crear_tabla(conectar_bd())    #ya la cree (vixomatu) descomentar para crear

def anadir_producto(conn, nombre, precio, stock):
    """ Añade un nuevo producto a la tabla """
    sql = "INSERT INTO productos (nombre, precio, stock) VALUES (%s, %s, %s);"
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, precio, stock))
        conn.commit()
        print(f"Producto '{nombre}' añadido exitosamente.")
    except psycopg2.IntegrityError:
        conn.rollback()  # Anula la transacción en caso de error (ej. nombre duplicado)
        print(f"Error: El producto '{nombre}' ya existe.")
    except Exception as e:
        conn.rollback()
        print(f"Ocurrió un error: {e}")

#anadir_producto(conectar_bd(), "Laptop Gamer Asus", 700000, 15) #ya lo añadí (vixomatu) descomentar para añadir

def mostrar_productos(conn):
    """ Muestra todos los productos de la tabla """
    sql = "SELECT id, nombre, precio, stock FROM productos;"
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            productos = cur.fetchall()
        if productos:
            print("ID\tNombre\t\tPrecio\tStock")
            for prod in productos:
                print(f"{prod[0]}\t{prod[1]}\t{prod[2]}\t{prod[3]}")
        else:
            print("No hay productos registrados.")
    except Exception as e:
        print(f"Ocurrió un error al consultar: {e}")
mostrar_productos(conectar_bd())  # Muestra los productos existentes