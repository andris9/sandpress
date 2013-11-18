# Sandpress

[Sandpress](http://www.sandpress.com/) is a simple secure storage application. You provide an encryption key and a [Yubikey](http://yubico.com/) one time password and you can save or store encrypted data.

All encryption is done on the browser side and encryption key is never revealed to the server. Additionally nobody without the proper Yubikey can access the encrypted data, so storing something with Sandpress should be pretty secure - even the service provider that stores the encrypted data can not read it.

## License

**MIT**