import * as crypto from 'crypto';

const userInfo = JSON.stringify({
  username: 'Ru',
  email: 'jgchengru@gmail.com'
});

const userInputHash = crypto.createHash('sha256').update(userInfo).digest('base64');

console.log('userInputHash');
console.log(userInputHash);

// +----------------+--------------+------+-----+-------------------+-----------------------------------------------+
// | Field          | Type         | Null | Key | Default           | Extra                                         |
// +----------------+--------------+------+-----+-------------------+-----------------------------------------------+
// | id             | int unsigned | NO   | PRI | NULL              | auto_increment                                |
// | walletAddress  | varchar(255) | NO   |     | NULL              |                                               |
// | vaultAddress   | varchar(255) | NO   |     | NULL              |                                               |
// | editionMint    | varchar(255) | NO   | MUL | NULL              |                                               |
// | redemptionType | tinyint      | NO   |     | NULL              |                                               |
// | userInputs     | varchar(255) | NO   |     | NULL              |                                               |
// | status         | tinyint      | NO   |     | 0                 |                                               |
// | token          | varchar(255) | YES  |     | NULL              |                                               |
// | createdAt      | timestamp    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
// | updatedAt      | timestamp    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
// +----------------+--------------+------+-----+-------------------+-----------------------------------------------+

// insert into dropRedemption (walletAddress, vaultAddress, editionMint, redemptionType, userInputs, status) values ('Gk8AZWEdgAGaCLJgQBf3DokW4DUFoxj9d5qWai5DJmoQ', '3Zfir6M1Phdg1mpy4TGqFh1ma49xZEEiq9FDa2e3pqLE', 'FF3wtCTpMUV3kU1E9mLK2KnGhgevpBvvfjGE2TMiecrR', 1, '{"iv":"c7ac76db452ddc4c3143978890226514","encrypted":"f354083894354a52f9d0e0018c82e705109f37d75fa70e1812b634664eaa9d4131da5e9f7854fcc3d8c495b41818a99c"}',  1 )

// insert into dropRedemption (walletAddress, vaultAddress, editionMint, redemptionType, userInputs, status) values ('Gk8AZWEdgAGaCLJgQBf3DokW4DUFoxj9d5qWai5DJmoQ', '3Zfir6M1Phdg1mpy4TGqFh1ma49xZEEiq9FDa2e3pqLE', 'AHwyDoywGUFNx44LwFHAaFYevfULAJVJ8ycdAjz9j6Cg', 1, '{"iv":"66a94720eca71185e042b2fe4c0dba3f","encrypted":"5effbedb3446fab24cabfe7d8fcb8555197351789863cc52837e0f5048cf043010833c295dd05221cb13d60d4b6ab711"}',  1 )
