import boto3
from botocore.exceptions import NoCredentialsError

s3 = boto3.client('s3')

bucket_name = "cancioneros"

def upload_to_aws(local_file: str, s3_file_name: str):
    try:
        s3.upload_file(local_file, bucket_name, s3_file_name)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False

def get_public_url(s3_file_name: str):
    try:
        response = s3.generate_presigned_url('get_object',
                                             Params={'Bucket': bucket_name, 'Key': s3_file_name},
                                             ExpiresIn=3600)  # URL expires in 1 hour
        print("Public URL generated successfully")
        return response
    except NoCredentialsError:
        print("Credentials not available")
        return None
