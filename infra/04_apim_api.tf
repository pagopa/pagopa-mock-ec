##########################
##  API  Mock EC PagoPA ##
##########################
locals {
 
  apim_mock_ec_primary_service_api = {
    display_name          = "Mock EC - PagoPA - Primary"
    description           = "API Mock EC Primary used by PagoPA developers for testing purposes"
    path                  = "mock-ec-primary/service"
    subscription_required = false
    service_url           = null
    hostname = "${local.hostname}/mock-ec-primary"
  }

  apim_mock_ec_secondary_service_api = {
    display_name          = "Mock EC - PagoPA - Secondary"
    description           = "API Mock EC Secondary used by PagoPA developers for testing purposes"
    path                  = "mock-ec-secondary/service"
    subscription_required = false
    service_url           = null
    hostname = "${local.hostname}/mock-ec-secondary"
  }
}


####################################
## PRIMARY
####################################

resource "azurerm_api_management_api_version_set" "api_mock_ec_primary" {
  count = var.env_short != "p" ? 1 : 0

  name                = "${var.env_short}-mock-ec-service-api-primary"
  resource_group_name = local.apim.rg
  api_management_name = local.apim.name
  display_name        = local.apim_mock_ec_primary_service_api.display_name
  versioning_scheme   = "Segment"
}

module "apim_api_mock_ec_primary_v1" {
  source = "./.terraform/modules/__v3__/api_management_api"
  count  = var.env_short != "p" ? 1 : 0

  name                  = "${local.project}-mock-ec-service-api-primary"
  api_management_name   = local.apim.name
  resource_group_name   = local.apim.rg
  product_ids           = [local.apim.product_id]
  subscription_required = false
  version_set_id = azurerm_api_management_api_version_set.api_mock_ec_primary[0].id
  api_version    = "v1"

  description  = local.apim_mock_ec_primary_service_api.description
  display_name = local.apim_mock_ec_primary_service_api.display_name
  path         = local.apim_mock_ec_primary_service_api.path
  protocols    = ["https"]
  service_url  = local.apim_mock_ec_primary_service_api.service_url

  content_format = "openapi"

  content_value = templatefile("./api/mock-ec-service/v1/_openapi.json.tpl", {
    host = local.apim_mock_ec_primary_service_api.hostname
  })

  xml_content = templatefile("./api/mock-ec-service/v1/_base_policy.xml.tpl", {
    hostname = local.apim_mock_ec_primary_service_api.hostname
  })
}

resource "terraform_data" "sha256_mock-ec_policy_primary_v1" {
  input = sha256(templatefile("./api/mock-ec-service/v1/_base_policy.xml.tpl", {
    hostname = local.apim_mock_ec_primary_service_api.hostname
  }))
}


####################################
## SECONDARY
####################################

resource "azurerm_api_management_api_version_set" "api_mock_ec_secondary" {
  count = var.env_short != "p" ? 1 : 0

  name                = "${var.env_short}-mock-ec-service-api-secondary"
  resource_group_name = local.apim.rg
  api_management_name = local.apim.name
  display_name        = local.apim_mock_ec_secondary_service_api.display_name
  versioning_scheme   = "Segment"
}

module "apim_api_mock_ec_secondary_v1" {
  source = "./.terraform/modules/__v3__/api_management_api"
  count  = var.env_short != "p" ? 1 : 0

  name                  = "${local.project}-mock-ec-service-api-secondary"
  api_management_name   = local.apim.name
  resource_group_name   = local.apim.rg
  product_ids           = [local.apim.product_id]
  subscription_required = false
  version_set_id = azurerm_api_management_api_version_set.api_mock_ec_secondary[0].id
  api_version    = "v1"

  description  = local.apim_mock_ec_secondary_service_api.description
  display_name = local.apim_mock_ec_secondary_service_api.display_name
  path         = local.apim_mock_ec_secondary_service_api.path
  protocols    = ["https"]
  service_url  = local.apim_mock_ec_secondary_service_api.service_url

  content_format = "openapi"

  content_value = templatefile("./api/mock-ec-service/v1/_openapi.json.tpl", {
    host = local.apim_mock_ec_secondary_service_api.hostname
  })

  xml_content = templatefile("./api/mock-ec-service/v1/_base_policy.xml.tpl", {
    hostname = local.apim_mock_ec_secondary_service_api.hostname
  })
}

resource "terraform_data" "sha256_mock-ec_policy_secondary_v1" {
  input = sha256(templatefile("./api/mock-ec-service/v1/_base_policy.xml.tpl", {
    hostname = local.apim_mock_ec_secondary_service_api.hostname
  }))
}



