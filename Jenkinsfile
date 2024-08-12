pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-credentials')
        DOCKER_IMAGE = "yassird/todo-app"
        DB_HOST = 'localhost'
        DB_USER = 'todo_user'
        DB_PASSWORD = 'Payne1@Max2'
        DB_NAME = 'todo_db'
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                // Install the dependencies
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                // Run the tests
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                // Build the Docker image
                sh 'docker build -t ${DOCKER_IMAGE}:${env.BUILD_NUMBER} .'
            }
        }
        
        stage('Push Docker Image') {
            steps {
                // Log in to Docker Hub
                sh 'echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin'
                
                // Push the Docker image
                sh 'docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}'
                
                // Optionally, tag the latest build
                sh 'docker tag ${DOCKER_IMAGE}:${env.BUILD_NUMBER} ${DOCKER_IMAGE}:${env.BUILD_NUMBER}'
                sh 'docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}'
            }
        }
    }
    
    post {
        always {
            // Clean up Docker environment to avoid disk space issues
            sh 'docker rmi ${DOCKER_IMAGE}:${env.BUILD_NUMBER} || true'
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
