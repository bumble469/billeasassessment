# billeasassessment

# CLONE REPO
git clone https://github.com/bumble469/billeasassessment.git
cd your-repo-name

## Setup

1. Install dependencies:  
   npm install

2. Start the development server:  
   npm run startDev

------------------------------------------------

## API Routes (POSTMAN)

### AUTH ROUTES

POST /api/signup
- Register a new user.
- Body:
  {
    "fullname":"yourfullname"
    "email": "user@example.com",
    "password": "yourpassword"
  }

POST /api/login
- Login an existing user.
- Body:
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }

POST /api/refresh-access-token (auth middleware applied)
since refresh token is set it checks if it exists and refreshes the access token

---------------------------
### BOOK ROUTES

### CREATE A BOOK  (authentication middleware applied so authentication or token refresh needed)
- POST /api/books
- Create a new book.
- Body (JSON):
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Genre Name",
    "description": "Optional description"
  }


### Get All Books  
GET /api/books  
Query Parameters (all optional):  
- page (default: 1)  
- limit (default: 10)  
- author (case-insensitive filter)  
- genre (case-insensitive filter)  

Example:  
/api/books?page=1&limit=10&author=firstname%20lastname&genre=genrename

---

### Get Book by ID 
GET /api/books/:id  
Query Parameters (optional):  
- page (default: 1)  
- limit (default: 10) 
Example:  
/api/books/68416f7314acf9b5ce843605

---

### Review a Book  (authentication middleware applied so authentication or token refresh needed)
POST /api/books/:id/reviews  
Path Parameter: book ID
Request Body (raw JSON):  
{
  "rating": 5,
  "comment": "It's nice"
}
Example:
http://localhost:5000/api/books/68416f7314acf9b5ce843605/reviews
---

### Update a Review  (authentication middleware applied so authentication or token refresh needed)
PUT /api/reviews/:id  
Path Parameter: review ID  
Request Body (raw JSON):  
{
  "rating": newVal,
  "comment": "new comment"
}
Example:
http://localhost:5000/api/reviews/6841b79c2d4a08ef8188934d
---

### Delete a Review  (authentication required)
DELETE /api/reviews/:id  
Path Parameter: review ID

Example:
http://localhost:5000/api/reviews/6841b79c2d4a08ef8188934d
---

### Search Books by Title or Author  
GET /api/search  
Query Parameters (optional):  
- title (partial, case-insensitive)  
- author (partial, case-insensitive)  
- page (default: 1)  
- limit (default: 10)  

Example:  
/api/search?title=The%20Great%20Gatsby&author=F.%20Scott%20Fitzgerald&page=1&limit=10
