packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "subnet_id" {
  default = "subnet-05c96a6b1f6c1b7f8"
}

variable "source_ami" {
  default = "ami-0866a3c8686eaeeba"
}

source "amazon-ebs" "my-ami" {
  region          = "${var.aws_region}"
  ami_name        = "csye6225_f24_app_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for Assignment 4"

  ami_regions = [
    "us-east-1"
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.micro"
  source_ami    = "${var.source_ami}"
  ssh_username  = "ubuntu"
  subnet_id     = "${var.subnet_id}"

  # Launch block device mappings
  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 25
    volume_type           = "gp2"
    delete_on_termination = true
  }
}

# Provisioner to install software
build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "file" {
    source      = "C:/Users/anush/Downloads/webapp-main.zip"
    destination = "/tmp/webapp-main.zip"
  }

   provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    script = "updateOs.sh"
  }

  provisioner "shell" {
    script = "userSet.sh"
  }

  provisioner "shell" {
    script = "appSet.sh"
  }

  provisioner "shell"{
    script = "systemd.sh"
  }
}