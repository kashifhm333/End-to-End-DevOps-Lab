terraform {
  required_version = ">= 1.5.0, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.67.0"
    }
  }
backend "s3" {
  bucket  = "devops-project-tfstate-529976312848"
  key     = "devops-project/terraform.tfstate"
  region  = "ap-southeast-2"
  encrypt = true
}
}
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
module "vpc" {
  source = "./modules/vpc"
  vpc_cidr = var.cidr_block
  public_subnet_cidrs = var.public_subnet_cidrs
  availability_zones = var.availability_zones
  
}
module "eks" {
  source              = "./modules/eks"
  cluster_name        = var.cluster_name
  cluster_version     = var.cluster_version
  subnet_ids          = module.vpc.public_subnet_ids
  node_instance_types = var.node_instance_types
  desired_size        = var.desired_node_count
  min_size            = var.min_node_count
  max_size            = var.max_node_count
  environment         = var.environment
}