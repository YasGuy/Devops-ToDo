pipeline {
    agent any
    
    environment {
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
                sh 'docker build -t ${DOCKER_IMAGE}:latest .'
            }
        }
        
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD'               
                    // Push the Docker image
                    sh 'docker push ${DOCKER_IMAGE}:latest'
                    
                    // Optionally, tag the latest build
                    sh 'docker tag ${DOCKER_IMAGE}:latest ${DOCKER_IMAGE}:latest'
                    sh 'docker push ${DOCKER_IMAGE}:latest'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker environment to avoid disk space issues
            sh 'docker rmi ${DOCKER_IMAGE}:latest || true'
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}