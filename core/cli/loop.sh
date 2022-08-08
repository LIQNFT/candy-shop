for v in {0..47}
do
echo "$v"
ts-node src/cli.ts mintPrint -k ~/Desktop/solTestKeys/enterprise_test2.json -e devnet -v v2 -ie true -ota FDs28X36pHPwCfBfYE3iXtNZGxQVrFLRvkvKDS3kDXYA  -tm So11111111111111111111111111111111111111112 -sc 8NaLkxRrZPVbSrS9BSJnF4VDoysyq4KDv5dYd1vJTV4d

done
