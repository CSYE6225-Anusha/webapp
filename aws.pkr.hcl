packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type = string
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

variable ami_regions {
  type    = list(string)
  default = ["us-east-1"]
}

variable device_name {
  type    = string
  default = "/dev/sda1"
}

variable volume_size {
  type    = string
  default = "25"
}

variable volume_type {
  type    = string
  default = "gp2"
}

variable delay_seconds {
  type    = number
  default = 120
}

variable max_attempts {
  type    = number
  default = 50
}

variable "ami_users" {
  type    = list(string)
  default = ["676206927418", "767828742291"]
}

source "amazon-ebs" "my-ami" {
  region          = var.aws_region
  ami_name        = "csye6225_f24_app_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for Assignment 6"

  ami_regions = var.ami_regions

  ami_users = var.ami_users

  aws_polling {
    delay_seconds = var.delay_seconds
    max_attempts  = var.max_attempts
  }

  instance_type = var.instance_type
  source_ami    = var.source_ami
  ssh_username  = var.ssh_username
  subnet_id     = var.subnet_id

  # Launch block device mappings
  launch_block_device_mappings {
    device_name           = var.device_name
    volume_size           = var.volume_size
    volume_type           = var.volume_type
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

 # Install the CloudWatch Agent
  provisioner "shell" {
    inline = [
      "sudo apt-get install -y wget",  # Install wget if not already installed
      "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",  # Download the CloudWatch agent
      "sudo dpkg -i amazon-cloudwatch-agent.deb",  # Install the CloudWatch agent
      "rm amazon-cloudwatch-agent.deb",  # Clean up the downloaded package
      "sudo systemctl enable amazon-cloudwatch-agent",  # Enable the agent to start at boot
      "sudo systemctl start amazon-cloudwatch-agent"  # Start the CloudWatch agent
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get remove -y git"
    ]
  }

  provisioner "shell" {
    script = "systemd.sh"
  }
}