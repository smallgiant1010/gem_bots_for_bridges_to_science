import requests

def main():
    uptimeRobotIPAddressRequest = requests.get("https://uptimerobot.com/inc/files/ips/IPv4andIPv6.txt").text.split("\n")
    print(uptimeRobotIPAddressRequest)


if __name__ == "__main__":
    main()