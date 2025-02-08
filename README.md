# Chief Finance Dex Backend

This repository contains the backend for the Chief Finance DEX Project, a decentralized exchange (DEX) platform. Users can provide liquidity to pools and swap tokens using cryptocurrency.

# Features

- Liquidity Provision: Users can add liquidity to pools.
- Token Swaps: Swap tokens across different pools seamlessly.
- Compatibility: Support for multiple blockchains, including Ethereum, Binance Smart Chain, Arbitrum, and more.

# Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Docker setup](#docker-setup)
- [Development Guidelines](#development-guidelines)
- [License](#license)

# Installation:

## Prerequisites

Make sure you have the following installed:

- Node.js (v14.x or later)

- Yarn (v1.x or later)

- Docker (if you are running with Docker)

# Running the Application

Once your .env file is set up, follow these steps to start the application:

1. Clone the repository

   ```shell
   $ git clone https://github.com/Minddeft-internal/chief-finance-dex-backend.git

   $ cd chief_finance_backend>
   ```

2. Set up environment variables:

   - Copy the content from `.env.example` into a new file `.env`.
   - Fill in the required environment variables.

3. Install the dependencies

   - Using npm:

     ```shell
     $ npm install
     ```

   - (Optional) Using Yarn:

     ```shell
     $ yarn install
     ```

4. Start the application:

   - Development Mode:

     ```shell
     $ npm run dev
     ```

   - Production Mode:

     ```shell
     $ npm run start:prod
     ```

5. Running Tests:

   - To run all tests:

     ```shell
     $ npm run test
     ```

   - To watch tests during development:

     ```shell
     $ npm run test:watch
     ```

   - For test coverage:
     ```shell
     $ npm run test:cov
     ```

# Environment Variables

To run the project, create a .env file at the root of the project directory and configure it based on the following template (.env.example).

- Create `.env` file at the root folder
- Setup `.env` variables from `.env.example`:


# Docker setup

Steps to run this project in docker:

- Download and install [docker](https://docs.docker.com/get-docker/ 'docker')
- Create `.env` file at the root folder
- Setup `.env` variables from `.env.example`:

1. Run the following command to start the server:
   ```shell
   $ yarn server:up
   ```
2. To rebuild containers and start the server:

   ```shell
   $ yarn server:rebuild
   ```

3. To shut down the server:
   ```shell
   $ yarn server:down
   ```

# Development Guidelines

To maintain a structured development process, please follow the guidelines below:

1. Feature Branches

   - When starting work on a new feature or bugfix, create a new branch. If there is an associated Jira ticket, the branch name should match the Jira ticket ID.

   - Example:

     ```shell
     $ git checkout -b feature/CFS-100
     ```

   - If there is no Jira ticket, use the following convention:

     ```shell
     $ git checkout -b feature/feature-name
     ```

2. Raising a Pull Request (PR)

   - After completing the feature or bugfix, push your branch to the remote repository
   - Open a pull request (PR) from your feature branch to the main branch.
   - Include in the PR description:
     - A reference to the Jira ticket (if applicable).
     - A brief summary of the feature or bugfix.

Following this workflow helps maintain consistency, traceability, and accountability in the development process.

# License

Nest is [MIT licensed](LICENSE).
