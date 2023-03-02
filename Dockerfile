FROM cypress/included:12.7.0

# Set the working directory to /app
WORKDIR /app

# Copy the project files into the container
COPY . .

# Start the Cypress test runner
CMD ["npm", "test"]
