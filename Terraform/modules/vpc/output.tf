output "vpc_cidr" {
    description = "VPC CIDR"
    value = aws_vpc.my_vpc.cidr_block
  
}

output "public_subnet_ids" {
  description = "The IDs of the public subnets"
  value       = aws_subnet.public_subnet[*].id
}