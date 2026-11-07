output "vpc_cidr" {
    description = "VPC CIDR"
    value = aws_vpc.my_vpc.cidr_block
  
}