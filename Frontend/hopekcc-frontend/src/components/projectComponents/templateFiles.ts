export interface FileData {
  id: number;
  file_name: string;
  content: string;
}
export interface Files {
  [key: string]: FileData;
}

/*
  export const templateFiles: Files = {
    'index.html': `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Home Page</title>
          <link rel="stylesheet" href="styles.css">
      </head>
      <body>
          <nav>
              <a href="index.html">Home</a>
              <a href="about.html">About</a>
          </nav>
          <h1>Welcome to My Project</h1>
          <p>This is the home page.</p>
          <script src="main.js"></script>
          <script src="utils.js"></script>
      </body>
      </html>`,
  
    'about.html': `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>About Page</title>
          <link rel="stylesheet" href="styles.css">
      </head>
      <body>
          <nav>
              <a href="index.html">Home</a>
              <a href="about.html">About</a>
          </nav>
          <h1>About Us</h1>
          <p>This is the about page.</p>
          <p>Counter: <span id="counter">0</span></p>
          <button id="incrementBtn">Increment</button>
          <script src="main.js"></script>
          <script src="utils.js"></script>
      </body>
      </html>`,
  
    'styles.css': `body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f0f0f0;
    }
  
    h1 {
      color: #333;
    }
  
    nav {
      margin-bottom: 20px;
    }
  
    nav a {
      margin-right: 10px;
    }`,
  
    'main.js': `console.log('Main script loaded');
  
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM fully loaded and parsed');
  
      const counterElement = document.getElementById('counter');
      const incrementBtn = document.getElementById('incrementBtn');
  
      if (incrementBtn && counterElement) {
        let count = 0;
  
        incrementBtn.addEventListener('click', () => {
          count = incrementValue(count);
          counterElement.textContent = count;
        });
      }
    });`,
  
    'utils.js': `function getCurrentTime() {
      return new Date().toLocaleTimeString();
    }
  
    function incrementValue(value) {
      return value + 1;
    }
  
    console.log('Current time:', getCurrentTime());`,
  };

  */
