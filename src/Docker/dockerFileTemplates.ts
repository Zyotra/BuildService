export const nodeDockerFile=`
# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Define environment variable
ENV NODE_ENV=production

# Run the application when the container launches
CMD ["npm", "start"]
`

export const nodeTypeScriptDockerFile=`
# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Define environment variable
ENV NODE_ENV=production

# Run the application when the container launches
CMD ["node", "dist/index.js"]
`

export const pythonDockerFile=`
# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file to the working directory
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Define environment variable
ENV PYTHONUNBUFFERED=1

# Run the application when the container launches
CMD ["python", "app.py"]
`
export const goDockerFile=`
# Use an official Golang runtime as a parent image
FROM golang:1.20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Go modules files to the working directory
COPY go.mod go.sum ./

# Download and install any needed packages specified in go.mod
RUN go mod download

# Copy the rest of the application code to the working directory
COPY . .

# Build the Go application
RUN go build -o main .

# Run the application when the container launches
CMD ["./main"]
`
export const javaDockerFile=`
# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Maven project files to the working directory
COPY pom.xml ./

# Download and install any needed packages specified in pom.xml
RUN apt-get update && apt-get install -y maven && mvn dependency:go-offline

# Copy the rest of the application code to the working directory
COPY . .

# Build the Java application
RUN mvn package

# Run the application when the container launches
CMD ["java", "-jar", "target/your-app.jar"]
`
export const rubyDockerFile=`
# Use an official Ruby runtime as a parent image
FROM ruby:3.1-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Gemfile and Gemfile.lock to the working directory
COPY Gemfile Gemfile.lock ./

# Install any needed packages specified in Gemfile
RUN bundle install

# Copy the rest of the application code to the working directory
COPY . .

# Define environment variable
ENV RUBY_ENV=production

# Run the application when the container launches
CMD ["ruby", "app.rb"]
`
export const phpDockerFile=`
# Use an official PHP runtime as a parent image
FROM php:8.1-apache

# Set the working directory in the container
WORKDIR /var/www/html
# Copy the application code to the working directory
COPY . .

# Install any needed PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Run the Apache server when the container launches
CMD ["apache2-foreground"]
`
export const dotnetDockerFile=`
# Use an official .NET runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["YourProject.csproj", "./"]
RUN dotnet restore "./YourProject.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "YourProject.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "YourProject.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourProject.dll"]
`   