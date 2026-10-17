pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        COMPOSE_PROJECT_NAME = 'nava9'
        COMPOSE_FILE         = 'docker-compose.yml'
        GIT_REPO_URL         = 'https://github.com/shobhit-bhardwaj/nava9-user-service.git'
        // Jenkins on macOS starts with a minimal PATH; add the usual Docker locations
        PATH                 = "/usr/local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:${env.PATH}"
    }

    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to build')
    }

    stages {
        stage('Checkout') {
            steps {
                git url: env.GIT_REPO_URL, branch: params.BRANCH
                // private repo? add:  credentialsId: 'github-credentials'
                sh 'git log -1 --oneline'
            }
        }

        stage('Verify tools') {
            steps {
                sh '''
                    which docker
                    docker --version
                    docker compose version
                '''
            }
        }

        stage('Validate compose file') {
            steps {
                sh 'docker compose config -q'
            }
        }

        stage('Build images') {
            steps {
                // builds the backend (app/Dockerfile) and the UI (frontend/Dockerfile)
                sh 'docker compose build --no-cache --pull'
            }
        }

        stage('Stop old stack') {
            steps {
                script {
                    sh 'docker compose down --remove-orphans'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker system prune -f'
            }
        }
    }

    post {
        success {
            sh 'docker compose ps'
            echo 'Deployed: UI on port 3000, API on port 8080'
        }
        failure {
            sh '''
                docker compose ps || true
                docker compose logs --tail=100 || true
            '''
        }
        cleanup {
            // remove dangling images left by rebuilds
            sh 'docker image prune -f || true'
        }
    }
}