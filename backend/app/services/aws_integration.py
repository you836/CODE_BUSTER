from app.config import settings

class AWSIntegrationLayer:
    def __init__(self):
        self.enabled = settings.AWS_INTEGRATION_ENABLED

    def get_iam_roles(self):
        """Connect to boto3 IAM client to get roles. Raises NotImplementedError if disabled."""
        if not self.enabled: return None
        raise NotImplementedError()

    def get_iam_policies(self):
        if not self.enabled: return None
        raise NotImplementedError()

    def get_cloudtrail_events(self):
        if not self.enabled: return None
        raise NotImplementedError()

    def simulate_policy(self):
        if not self.enabled: return None
        raise NotImplementedError()
