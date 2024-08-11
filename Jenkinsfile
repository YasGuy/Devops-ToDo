pipeline {
    agent {
        docker {
            image 'node:22'
            args '-u root'
        }
    }

    environment {
        NODE_VERSION = '22'
        DOCKER_IMAGE_NAME = 'todo-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DB_HOST = 'localhost'
        DB_PORT = '3306'
        DB_NAME = 'todo_db'
        DB_CREDENTIALS_ID = 'db-credentials'
        REPLACEMENT_PASSWORD = 'replacement-password'
        DOCKER_CREDENTIALS_ID = 'docker-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start MySQL') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DB_CREDENTIALS_ID}", usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')]) {
                        sh """
                            docker run -d \
                              --name mysql-db \
                              -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} \
                              -e MYSQL_DATABASE=${DB_NAME} \
                              -p ${DB_PORT}:3306 \
                              mysql:9.0
                        """
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
        }  // This runs the pipeline on a Jenkins node (host machine)
        }

        stage('Wait for MySQL') {
            steps {
                script {
                    sh 'until mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;" > /dev/null 2>&1; do echo "Waiting for MySQL..."; sleep 5; done'
                }
            }
        }

        stage('Initialize Database') {
            steps {
                script {
                    withCredentials([string(credentialsId: "${REPLACEMENT_PASSWORD}", variable: 'REPLACEMENT_PASSWORD')]) {
                        sh """
                            sed -i 's/PLACEHOLDER_PASSWORD/${REPLACEMENT_PASSWORD}/g' init.sql
                            docker exec -i mysql-db mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < init.sql
                        """
                    }
                }
            }
        }

        stage('Start App and Test') {
            parallel {
                stage('Start App') {
                    steps {
                        script {
                            docker.image('node:22').inside {
                                sh 'nohup npm start &'
                            }
                        }
                    }
                }
                
                stage('Test') {
                    steps {
                        script {
                            docker.image('node:22').inside {
                                sh 'npm test'
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh 'docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}'
                        sh 'docker push ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker stop mysql-db || true'
                sh 'docker rm mysql-db || true'
            }
            cleanWs()
        }

        failure {
            echo 'Build failed!'
        }

        success {
            echo 'Build succeeded!'
        }
    }
}
