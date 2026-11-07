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


# qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq


variable "cluster_name" {
  description = "The name of the Amazon EKS cluster"
  type        = string
  default     = "flood-digital-twin-eks"
}

variable "cluster_version" {
  description = "Kubernetes control plane version"
  type        = string
  default     = "1.36"
}



variable "node_instance_types" {
  description = "EC2 instance types for the EKS worker nodes"
  type        = list(string)
  default     = ["c7i-flex.large"]
}

variable "desired_node_count" {
  description = "Desired number of worker nodes in the default node group"
  type        = number
  default     = 2
}

variable "min_node_count" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}
