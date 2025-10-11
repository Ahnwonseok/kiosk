pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-52-91-215-61.compute-1.amazonaws.com'  // 배포할 EC2 퍼블릭 IP
        PEM_PATH = "C:\\ProgramData\\Jenkins\\kiosk_key.pem"
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
                    // cross-env CI=false를 package.json에서 이미 설정했으므로 그대로 빌드
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2...'
        bat """        
        scp -i "C:\Users\lenovo\Downloads\kiosk_key.pem" be/build/libs/*.jar ec2-user@ec2-52-91-215-61.compute-1.amazonaws.com:/home/ec2-user/app/
        scp -i "C:\Users\lenovo\Downloads\kiosk_key.pem" fe/build/* ec2-user@ec2-52-91-215-61.compute-1.amazonaws.com:/home/ec2-user/app/frontend/
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
