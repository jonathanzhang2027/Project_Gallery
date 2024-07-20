from storages.backends.gcloud import GoogleCloudStorage

class CustomGoogleCloudStorage(GoogleCloudStorage):
    def __init__(self, *args, **kwargs):
        kwargs['bucket_name'] = 'team-la'
        super(CustomGoogleCloudStorage, self).__init__(*args, **kwargs)