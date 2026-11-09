// Use a declarative pipeline so every build stage is visible in Jenkins.
pipeline {
    // Run this pipeline on any Jenkins agent with Docker, Compose, Node.js and curl.
    agent any

    // Keep the Docker Hub account and image tags consistent across stages.
    environment {
        DOCKERHUB_USER = 'nasirbloch323'
        IMAGE_TAG = "${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/foodexpress-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/foodexpress-backend"
    }

    // Trigger the job when GitHub sends a push webhook.
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                // Check out the branch revision that started this build.
                checkout scm
                // Record the source commit in the Jenkins build log.
                sh 'git log -1 --oneline'
            }
        }

        stage('Validate Compose') {
            steps {
                // Check that the Compose file is valid before building images.
                sh 'docker compose -f docker-compose.yml config --quiet'
            }
        }

        stage('Test Backend') {
            steps {
                // Install backend dependencies and run the built-in Node test suite.
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build Images') {
            steps {
                // Build and tag the frontend image with a unique build number and latest.
                sh 'docker build -t $FRONTEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest frontend'
                // Build and tag the backend image with a unique build number and latest.
                sh 'docker build -t $BACKEND_IMAGE:$IMAGE_TAG -t $BACKEND_IMAGE:latest backend'
            }
        }

        stage('Push Images') {
            steps {
                // Retrieve the Docker Hub account token securely from Jenkins Credentials.
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    // Pass the token through stdin instead of exposing it in command arguments.
                    sh 'echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin'
                    // Publish both frontend tags to Docker Hub.
                    sh 'docker push $FRONTEND_IMAGE:$IMAGE_TAG'
                    sh 'docker push $FRONTEND_IMAGE:latest'
                    // Publish both backend tags to Docker Hub.
                    sh 'docker push $BACKEND_IMAGE:$IMAGE_TAG'
                    sh 'docker push $BACKEND_IMAGE:latest'
                    // Clear the authenticated Docker CLI session.
                    sh 'docker logout'
                }
            }
        }

        stage('Remove Local Build Images') {
            steps {
                // Remove the image tags already pushed to Docker Hub to free disk space.
                sh 'docker image rm $FRONTEND_IMAGE:$IMAGE_TAG $FRONTEND_IMAGE:latest $BACKEND_IMAGE:$IMAGE_TAG $BACKEND_IMAGE:latest || true'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                // Pass the Docker Hub image owner and build number into Compose.
                withEnv(["DOCKERHUB_USER=$DOCKERHUB_USER", "IMAGE_TAG=$IMAGE_TAG"]) {
                    // Pull the exact images just published by the previous stage.
                    sh 'docker compose -f docker-compose.yml pull'
                    // Start the database, API and frontend as a single application.
                    sh 'docker compose -f docker-compose.yml up -d --remove-orphans'
                    // Print service state for deployment verification.
                    sh 'docker compose -f docker-compose.yml ps'
                }
            }
        }

        stage('Smoke Test') {
            steps {
                // Retry the health endpoint through Nginx until the stack is ready.
                sh 'curl --fail --retry 10 --retry-delay 3 http://localhost:8080/api/health'
                // Confirm the frontend responds over the published HTTP port.
                sh 'curl --fail --retry 10 --retry-delay 3 http://localhost:8080/'
                // Confirm the menu endpoint is reachable through the frontend proxy.
                sh 'curl --fail --retry 10 --retry-delay 3 http://localhost:8080/api/foods'
            }
        }
    }

    post {
        always {
            // Show recent logs to make deployment failures easier to diagnose.
            sh 'docker compose -f docker-compose.yml logs --tail=50 || true'
            // Remove dangling layers without deleting database volumes.
            sh 'docker image prune -f'
        }
        success {
            // Mark a successful build and deployment in the Jenkins console.
            echo 'FoodExpress images published and Docker Compose deployment completed.'
        }
        failure {
            // Keep the failure explicit so the operator checks the stage logs.
            echo 'Task 6 pipeline failed. Review the Jenkins stage logs and Compose status.'
        }
    }
}