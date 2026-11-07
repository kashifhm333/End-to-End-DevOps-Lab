variable "cidr_block" {
    description = "List of CIDR blocks for the VPC"
    type        = string
    default     = "10.0.0.0/16"
  
}

variable "aws_region" {
  description = "The AWS Region where resources will be provisioned"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
 description = "The environment name"
 type        = string
 default     = "dev"
}

variable "public_subnet_cidrs" {
    description = "the subnet cidr block"
    type = list(string)
    default = [ "10.0.1.0/24", "10.0.2.0/24" ]
  
}

variable "availability_zones" {
    type = list(string)
    default = [ "ap-southeast-2a", "ap-southeast-2b" ]
  
}