pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git url: "${REPO_URL}", credentialsId: "${REPO_CRED}", branch: 'main'
            }
        }

        stage('Build Backend') {
            steps {
                dir('be') {
                    bat 'gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('fe') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 using Jenkins SSH Credentials...'
                
                sshagent(['ec2-deploy-key']) {  // Jenkins Credentials ID
                    // 배포: Backend JAR
                    bat """
                    scp be\\build\\libs\\*.jar ec2-user@${EC2_HOST}:/home/ec2-user/app/
                    """

                    // 배포: Frontend build
                    bat """
                    scp -r fe\\build\\* ec2-user@${EC2_HOST}:/home/ec2-user/app/frontend/
                    """

                    // 필요시 EC2에서 서비스 재시작
                    bat """
                    ssh ec2-user@${EC2_HOST} "sudo systemctl restart kiosk-app.service"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '빌드 & 배포 완료!'
        }
        failure {
            echo '빌드 실패! 로그를 확인하세요.'
        }
    }
}
