variable "vpc_cidr" {
    description = "CIDR block for the VPC"
    type        = string
  
}

variable "tags" {
    description = "tags"
    type = map(string)
    default = {
        "Name" = "my_vpc"
        "createdby" = "Kashif"
    }
}
variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames"
  type        = bool
  default     = true
}
variable "enable_dns_support" {
  description = "Enable DNS support"
  type        = bool
  default     = true
}

variable "public_subnet_cidrs" {
    description = "List of CIDR blocks for the public subnets"
    type        = list(string)
  
}

variable "availability_zones" {
  type = list(string)

}