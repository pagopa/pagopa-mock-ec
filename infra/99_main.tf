terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.30.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.30.0"
    }
    azapi = {
      source  = "Azure/azapi"
      version = "= 1.3.0"
    }
  }

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

provider "azapi" {}

data "azurerm_subscription" "current" {}

data "azurerm_client_config" "current" {}


module "__v3__" {
  # v8.62.1
  source = "git::https://github.com/pagopa/terraform-azurerm-v3?ref=f3485105e35ce8c801209dcbb4ef72f3d944f0e5"
}
