var config = require('./config');


if(config.isLocal)
{
    module.exports = {
        adminUid: 'admin',
        adminPsw: 'int123',
        adminLdapDn: 'cn=admin,dc=ubuntuldap,dc=com',
        adminLdapCredentials: 'int123',
        ldapDN: ',ou=user,dc=ubuntuldap,dc=com',
        ldapBind: 'cn=',
        ldapUrl: 'ldap://172.16.1.56:389',
        objectClass: 'inetOrgPerson'
    };
} else {
    module.exports = {
        adminUid: 'srix',
        adminPsw: 'ispi3p14',
        adminLdapDn: 'cn=srix,dc=integramicro,dc=com',
        adminLdapCredentials: 'ispi3p14',
        ldapDN: ',ou=people,dc=integramicro,dc=co,dc=in',
        ldapBind: 'uid=',
        ldapUrl: 'ldap://172.16.2.14:389',
        objectClass: 'inetOrgPerson'
    };


}

