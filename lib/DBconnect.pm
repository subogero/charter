package DBconnect;
use strict;
use warnings;

use base qw(Exporter);

our @EXPORT = qw( dbConnectInfo db_connect $dbhs );
our $dbhs = {};

sub dbConnectInfo {
    return {};
}

sub db_connect {
    my $schema = shift;
    die "DBconnect not yet implemented";
}
