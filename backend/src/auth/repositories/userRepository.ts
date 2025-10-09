/**
 * REPOSITORIO DE USUARIOS
 * ======================
 * 
 * Este archivo implementa un repositorio para la autenticación de usuarios.
 * Se conecta a la base de datos o servicio externo para validar credenciales.
 */

import { UserLogin, UserPublic } from '../types/authTypes';

/**
 * CLASE REPOSITORIO USUARIOS
 * =========================
 */
export class UserRepository {
  // Aquí deberías definir tu conexión a la base de datos
  // Por ejemplo, si usas TypeORM, Prisma o Sequelize
  // private dbConnection: DatabaseConnection;
  
  constructor() {
    // Inicializar la conexión a la base de datos
    // this.dbConnection = new DatabaseConnection();
  }

  /**
   * Valida las credenciales de un usuario
   * @param credentials - Email y contraseña a validar
   * @returns UserPublic | null - Datos públicos del usuario o null si las credenciales son inválidas
   */
  async validateCredentials(credentials: UserLogin): Promise<UserPublic | null> {
    try {
      // Aquí implementarías la consulta a la base de datos
      // Ejemplo con SQL directo:
      // const query = `SELECT id_usuario, nombre, apellido, email, password, telefono, avatar_url, rol
      //                FROM usuarios
      //                WHERE email = ?`;
      // const user = await this.dbConnection.query(query, [credentials.email]);
      
      // Verificar si existe el usuario y comparar contraseña
      // Aquí deberías usar bcrypt.compare() para comparar contraseñas hasheadas
      // if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      //   return null;
      // }
      
      // Por ahora, como no tenemos base de datos conectada, retornamos null
      console.log('Intento de login con:', credentials.email);
      return null;
    } catch (error) {
      console.error('Error al validar credenciales:', error);
      return null;
    }
  }
  
  /**
   * Busca un usuario por su ID
   * @param userId - ID del usuario a buscar
   * @returns UserPublic | null - Datos públicos del usuario o null si no existe
   */
  async findById(userId: number): Promise<UserPublic | null> {
    try {
      // Aquí implementarías la consulta a la base de datos
      // Ejemplo con SQL directo:
      // const query = `SELECT id_usuario, nombre, apellido, email, telefono, avatar_url, rol
      //                FROM usuarios
      //                WHERE id_usuario = ?`;
      // const user = await this.dbConnection.query(query, [userId]);
      
      // Si no existe el usuario
      // if (!user) {
      //   return null;
      // }
      
      // Por ahora, como no tenemos base de datos conectada, retornamos null

      
      console.log('Buscando usuario con ID:', userId);
      return null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return null;
    }
  }
}