packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "subnet_id" {
  type = string
}

variable "source_ami" {
  type = string
}

variable instance_type {
  type = string
}


variable ssh_username {
  type = string
}

variable "ami_users" {
  type    = list(string)
  default = ["676206927418", "767828742291"]
}

source "amazon-ebs" "my-ami" {
  region          = "${var.aws_region}"
  ami_name        = "csye6225_f24_app_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for Assignment 4"

  ami_regions = [
    "us-east-1"
  ]

  ami_users = "${var.ami_users}"


  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "${var.instance_type}"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  # Launch block device mappings
  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = "25"
    volume_type           = "gp2"
    delete_on_termination = true
  }
}

# Provisioner to install software
build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
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

  provisioner "shell" {
    script = "systemd.sh"
  }
}