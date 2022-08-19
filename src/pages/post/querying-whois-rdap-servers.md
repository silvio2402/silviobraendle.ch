---
layout: ../../layouts/post.astro
title: Querying WHOIS/RDAP servers
client: Self
publishDate: 2022-08-12 00:00:00
img: /assets/querying-whois-rdap-servers/iana-whois-server-response-google-com.png
description: |
  Querying information about internet resources using the WHOIS and RDAP protocol.
tags:
  - networking
  - programming
---

## WHOIS Protocol

### Usages for WHOIS

According to [ICANN](icann.org) (Internet Corporation for Assigned Names and Numbers):

> Internet operators use WHOIS to identify individuals or entities responsible for the operation of a network resource on the Internet. Over time, WHOIS has evolved to serve the need of many different stakeholders, such as domain name registrants, law enforcement agents, intellectual property and trademark owners, businesses and individuals.
>
> Source: [https://whois.icann.org/en/primer](https://whois.icann.org/en/primer#:~:text=Internet%20operators%20use,businesses%20and%20individuals.)

Essentially, people can query WHOIS to get information about contact persons or responsible persons for this resource.

### Authoritative WHOIS Service

Some TLD (Top-level domain) WHOIS servers like the one from the `org` registry store the complete information about their domains, which is called a "thick" WHOIS server, while others like the `com` registry WHOIS server will refer to the registrar's WHOIS server where the domain was registered, which is called a "thin" WHOIS server.

### Querying with the WHOIS Protocol

Users are able to query WHOIS servers using the [`whois`](https://www.unix.com/man-page/linux/1/whois/) Unix command line tool.
The WHOIS protocol is publicly specified by the [RFC 3912: WHOIS Protocol Specification](https://www.rfc-editor.org/rfc/rfc3912), which makes it rather easy to code your own WHOIS client, like I did. The WHOIS response is in a "human-readable" format, which makes it harder for computers to parse it, especially with the unfortunate reality that the format is not specified and different WHOIS servers use different formats. Fortunately though, [IANA (Internet Assigned Numbers Authority)](https://www.iana.org/) experimented in 2010 and later adopted a new WHOIS server which provides the output in a more predictable and RPSL-style format as explained on the ICANN blog:

> The first thing that one would notice comparing the output is that we have adopted a new RPSL-style output format. It is a more predictable format that is commonly used by other WHOIS services, and also is easier to parse with a predictable “key: value” format.
>
> Source: [https://www.icann.org/en/blogs/details/try-the-new-iana-whois-server-20-5-2010-en](https://www.icann.org/en/blogs/details/try-the-new-iana-whois-server-20-5-2010-en#:~:text=The%20first%20thing%20that%20one%20would%20notice%20comparing%20the%20output%20is%20that%20we%20have%20adopted%20a%20new%20RPSL%2Dstyle%20output%20format.%20It%20is%20a%20more%20predictable%20format%20that%20is%20commonly%20used%20by%20other%20WHOIS%20services%2C%20and%20also%20is%20easier%20to%20parse%20with%20a%20predictable%20%E2%80%9Ckey%3A%20value%E2%80%9D%20format.)

RPSL is specified by the [RFC 2622: Routing Policy Specification Language (RPSL)](https://www.rfc-editor.org/rfc/rfc2622).

The following Python function I wrote can be used to query the IANA WHOIS server and parse it in an acceptable format:

```py
import socket


def whois(cmd: str, whois_server="whois.iana.org", port=43):
    # Connect to the service host
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((whois_server, port))
    # Send a single "command line", ending with <CRLF>.
    sock.send(cmd.encode("utf-8"))
    sock.send("\r\n".encode("utf-8"))
    # Receive information in response to the command line.
    msg = ""
    data = sock.recv(1024)
    while data:
        msg += data.decode("utf-8")
        data = sock.recv(1024)
    groups = []
    currGroup = {}
    for line in msg.splitlines():
        if line.startswith("%"):  # Skip comments
            continue
        if line == "":  # Blank line refers to start of new group
            if currGroup != {}:
                groups.append(currGroup)
            currGroup = {}
            continue
        kv = line.split(":", 1)  # Split line to key/value pair
        key = kv[0].lstrip()  # Remove leading spaces
        value = kv[1].lstrip()  # Remove leading spaces
        if key in currGroup:
            # If key already exists, join values by newline
            currGroup[key] = "\n".join([currGroup[key], value])
        else:
            currGroup[key] = value
    return groups


if __name__ == "__main__":
    import json

    s = whois("google.com")
    print(json.dumps(s, indent=4))
```

My full GitHub Gist (with example output): [Query WHOIS information from IANA server](https://gist.github.com/silvio2402/0e8b6de1494ce6cf0408a8ac337c14d6)

## Registration Data Access Protocol (RDAP)

RDAP (Registration Data Access Protocol), which is the successor to the very old WHOIS protocol, provides, according to [rdap.org](https://about.rdap.org/):

> - A machine-readable representation of registration data;
> - Differentiated access;
> - Structured request and response semantics;
> - Extensibility.
>
> Source: [https://about.rdap.org](https://about.rdap.org/#:~:text=A%20machine%2Dreadable,Extensibility.)

RDAP is uses RESTful communication through HTTP, with the response being in JSON format, making it way easier to parse and automate requests.

### Authoritative RDAP Service

IANA provides a bootstrap files at <https://data.iana.org/rdap/> which maps a resource (e.g. a TLD like `com`) to an RDAP server. This RDAP server might redirect to a different one, etc... until the authoritative RDAP server is reached. You could also use a bootstrap RDAP server like <https://rdap.org/> which will basically keep track of the IANA bootstrap file for you and lead you to the same, authoritative server.

### Querying with the RDAP Protocol

Unlike the WHOIS protocol, I found multiple RFC specifications for the RDAP protocol including the following RFCs:

<details>
    <summary>RFC Specs regarding RDAP</summary>
    <ul>
        <li><a href="https://www.rfc-editor.org/rfc/rfc7480">RFC 7480: HTTP Usage in the Registration Data Access Protocol (RDAP)</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc7481">RFC 7481: Security Services for the Registration Data Access Protocol (RDAP)</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc8056">RFC 8056: Extensible Provisioning Protocol (EPP) and Registration Data Access Protocol (RDAP) Status Mapping</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc8521">RFC 8521: Registration Data Access Protocol (RDAP) Object Tagging</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc8605">RFC 8605: vCard Format Extensions: ICANN Extensions for the Registration Data Access Protocol (RDAP)</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc8977">RFC 8977: Registration Data Access Protocol (RDAP) Query Parameters for Result Sorting and Paging</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc9082">RFC 9082: Registration Data Access Protocol (RDAP) Query Format</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc9083">RFC 9083: JSON Responses for the Registration Data Access Protocol (RDAP)</a></li>
        <li><a href="https://www.rfc-editor.org/rfc/rfc9224">RFC 9224: Finding the Authoritative Registration Data Access Protocol (RDAP) Service</a></li>
    </ul>
</details>

#### Fetching the Bootstrap Data

First, the bootstrap data for the specific purpose has to be fetched. The bootstrap data could be saved so it doesn't have to be fetched on every query.
The following bootstrap files exist:

<details>
    <summary>IANA Bootstrap Files</summary>
    <ul>
        <li><a href="https://data.iana.org/rdap/asn.json">data.iana.org/rdap/asn.json</a></li>
        <li><a href="https://data.iana.org/rdap/dns.json">data.iana.org/rdap/dns.json</a></li>
        <li><a href="https://data.iana.org/rdap/ipv4.json">data.iana.org/rdap/ipv4.json</a></li>
        <li><a href="https://data.iana.org/rdap/ipv6.json">data.iana.org/rdap/ipv6.json</a></li>
        <li><a href="https://data.iana.org/rdap/object-tags.json">data.iana.org/rdap/object-tags.json</a></li>
    </ul>
</details>

Here's a Python function I made to fetch bootstrap data for type `asn`, `dns`, `ipv4`, or `ipv6`.

```py
import http.client
import urllib.parse
import json


def rdap_fetch_bootstrap(
    obj_type: str, bootstrap_server_base="https://data.iana.org/rdap", fetch_url=None
):
    if not fetch_url:
        fetch_url = "".join([bootstrap_server_base, "/", obj_type, ".json"])
    url_parse = urllib.parse.urlparse(fetch_url)
    https = url_parse.scheme == "https"
    port = http.client.HTTPS_PORT if https else http.client.HTTP_PORT
    conn = http.client.HTTPSConnection(url_parse.netloc, port)
    # Send HTTPS request
    conn.request("GET", url_parse.path)
    res = conn.getresponse()
    if res.status != 200:
        raise Exception()

    data = json.loads(res.read())
    return data
```

My full GitHub Gist (with example output): [Query RDAP information using a server from IANA's bootstrap file](https://gist.github.com/silvio2402/22bc8929ba82c1d9c4a12503f86eb45b)

This data structure might reduce file size, but there could be a more optimal structure for finding an object inside it. With the structure used, we have to loop through the whole array, until the desired object is found.
I developed this Python function to do that loop through the services array of the bootstrap data from the `bootstrap` parameter, and check each value if it matches the `obj_query` provided in the parameter.

```py
import ipaddress


def rdap_find_in_bootstrap(obj_type: str, obj_query: str, bootstrap: dict):
    if obj_type == "asn":
        for service in bootstrap["services"]:
            for value in service[0]:
                range: list[str] = value.split("-")
                range0 = int(range[0])
                obj_int = int(obj_query)
                if len(range) > 1:
                    range1 = int(range[1])
                    if not (range0 <= obj_int and obj_int <= range1):
                        continue
                else:
                    if obj_int != range0:
                        continue
                return service[1]
    elif obj_type == "dns":
        tld = obj_query.split(".")[-1]
        for service in bootstrap["services"]:
            for value in service[0]:
                if value != tld:
                    continue
                return service[1]
    elif obj_type == "ipv4" or obj_type == "ipv6":
        for service in bootstrap["services"]:
            for value in service[0]:
                value_net = ipaddress.ip_network(value)
                query_ip = ipaddress.ip_address(obj_query)
                if query_ip not in value_net:
                    continue
                return service[1]
    return []
```

My full GitHub Gist (with example output): [Query RDAP information using a server from IANA's bootstrap file](https://gist.github.com/silvio2402/22bc8929ba82c1d9c4a12503f86eb45b)

#### Sending RDAP Queries

An RDAP query can now be sent to one of the RDAP services returned by the `rdap_find_in_bootstrap` function. First an HTTP GET request is made to the following URL pattern: {baseurl}/{type}/{object} (e.g. [`https://rdap.verisign.com/com/v1/domain/google.com`](https://rdap.verisign.com/com/v1//domain/google.com))
The `type` can be either one of `ip`, `autnum`, `domain`, `nameserver`, `entity`, or `help` as specified in [RFC 9082: Registration Data Access Protocol (RDAP) Query Format](https://www.rfc-editor.org/rfc/rfc9082).

I wrote this Python function to send an RDAP request.

```py
import http.client
import urllib.parse
import json


def rdap(
    obj_type: str,
    obj_query: str,
    rdap_server_base="https://rdap.org",
    redirects=0,
    query_url=None,
):
    if not query_url:
        # The query URL is constructed by concatenating the base URL with the entity path segment
        query_url = "".join([rdap_server_base, obj_type, "/", obj_query])
    url_parse = urllib.parse.urlparse(query_url)
    https = url_parse.scheme == "https"
    HTTP_SConn = http.client.HTTPSConnection if https else http.client.HTTPConnection
    port = http.client.HTTPS_PORT if https else http.client.HTTP_PORT
    conn = HTTP_SConn(url_parse.netloc, port)
    # Send HTTP/S request
    conn.request("GET", url_parse.path)
    res = conn.getresponse()
    if res.status == 301 or res.status == 302 or res.status == 303 or res.status == 307:
        # Server knows of an RDAP service which is authoritative for the requested resource.
        # Follow the URL listed in the Location header.
        if redirects > 10:
            # Limit max redirects to 10
            raise Exception()
        elif res.headers["Location"] == query_url:
            # Prevent redirecting to same server
            raise Exception()
        else:
            return rdap(
                obj_type,
                obj_query,
                redirects=redirects + 1,
                query_url=res.headers["Location"],
            )
    elif res.status == 400:
        # Server received an invalid request (malformed path, unsupported object type, invalid IP address, etc).
        raise Exception()
    elif res.status == 404:
        # Server didn't know of an RDAP service which is authoritative for the requested resource.
        raise Exception()
    elif res.status == 429:
        # Exceeded the server's rate limit.
        raise Exception()
    elif res.status == 500:
        # Server is broken in some way.
        raise Exception()
    elif res.status == 504:
        # Server needed to refresh the IANA bootstrap registry, but couldn't.
        raise Exception()
    elif res.status != 200:
        raise Exception()

    data = json.loads(res.read())
    return data
```

My full GitHub Gist (with example output): [Query RDAP information using a server from IANA's bootstrap file](https://gist.github.com/silvio2402/22bc8929ba82c1d9c4a12503f86eb45b)
