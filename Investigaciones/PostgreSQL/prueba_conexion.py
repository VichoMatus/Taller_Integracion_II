import psycopg2

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

    cur.close()
    conn.close()
except psycopg2.Error as e:
    print("Error al conectar a la base de datos:")
    print(e)