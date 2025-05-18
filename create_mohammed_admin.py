import bcrypt
import psycopg2
from psycopg2 import sql

# Database connection parameters
db_params = {
    'dbname': 'dms',
    'user': 'dmsuser',
    'password': 'dmspassword',
    'host': 'localhost',
    'port': '5433'
}

def create_admin_user():
    # Connect to the database
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Hash the password
        password = "admin123"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10))
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", 
                      ("mohammed", "mohammed@example.com"))
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id = existing_user[0]
            print(f"User 'mohammed' already exists with ID {user_id}. Updating password...")
            
            # Update existing user
            cursor.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (hashed_password.decode('utf-8'), user_id)
            )
        else:
            # Insert new user
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id",
                ("mohammed", "mohammed@example.com", hashed_password.decode('utf-8'))
            )
            user_id = cursor.fetchone()[0]
            print(f"Created new user 'mohammed' with ID {user_id}")
            
            # Check if admin role exists
            cursor.execute("SELECT id FROM roles WHERE name = 'ROLE_ADMIN'")
            admin_role = cursor.fetchone()
            
            if admin_role:
                admin_role_id = admin_role[0]
                
                # Check if user already has admin role
                cursor.execute(
                    "SELECT * FROM user_roles WHERE user_id = %s AND role_id = %s",
                    (user_id, admin_role_id)
                )
                existing_role = cursor.fetchone()
                
                if not existing_role:
                    # Assign admin role to user
                    cursor.execute(
                        "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                        (user_id, admin_role_id)
                    )
                    print(f"Assigned admin role to user 'mohammed'")
                else:
                    print(f"User 'mohammed' already has admin role")
            else:
                print("Admin role not found. Please ensure roles are initialized.")
        
        # Commit the transaction
        conn.commit()
        print("Admin user 'mohammed' with password 'admin123' is ready to use.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    create_admin_user()
