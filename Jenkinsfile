pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'
        PEM_PATH = "C:\\Jenkins\\keys\\kiosk_key.pem"   // Jenkins 계정 전용 폴더
        REPO_URL = 'https://github.com/Ahnwonseok/kiosk.git'
        REPO_CRED = 'kiosk'
        BASH = "C:\\Program Files\\Git\\bin\\bash.exe" // Git Bash 경로
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
                echo 'Deploying to EC2...'
                // Git Bash를 이용해 scp 실행
                bat """
                "${BASH}" -c "scp -i '${PEM_PATH}' be/build/libs/*.jar ec2-user@${EC2_HOST}:/home/ec2-user/app/"
                "${BASH}" -c "scp -i '${PEM_PATH}' -r fe/build/* ec2-user@${EC2_HOST}:/home/ec2-user/app/frontend/"
                """
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
