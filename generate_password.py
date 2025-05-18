import bcrypt
import sys

def hash_password(password):
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

if __name__ == "__main__":
    password = "admin123"
    hashed_password = hash_password(password)
    print(f"Original password: {password}")
    print(f"Hashed password: {hashed_password}")
