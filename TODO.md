
- self sign up tenant
    - application settings -> applications urls -> sign up urls

- on tenant create
    - in tenant sign up flow - upsert google social IDP

    - add google social to tenant level so adding okta doenst override application social idp
    1. upsert copy the google social over (google creds as env vars)
        - use terraform to get client id and secret
    2. upsert the okta



- google social auth - Terraform?
    - what wb info is provided to know that you cant change password
        - idp_name in session == google

- google enterprise auth - Terraform?
    - go into tenant -> hit api from app
    - enable JIT provisioning 
        - which fields you want to map from google to wristband for sign u



- user invite
    - perk party'