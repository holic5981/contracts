import { should } from 'chai';
import { RBACInstance } from '../../types/truffle-contracts';

const RBAC = artifacts.require('./access/RBAC.sol') as Truffle.Contract<RBACInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('RBAC', (accounts) => {
    let rbac: RBACInstance;
    const root = accounts[1];
    // const NO_ROLE = '0x0';
    const ROOT_ROLE = web3.utils.fromAscii('ROOT');
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[2];
    const user2 = accounts[3];

    beforeEach(async () => {
        rbac = await RBAC.new(root);
    });

    it('roleExists returns false for non existing roles', async () => {
        assert.isFalse(await rbac.roleExists(ADDED_ROLE));
    });

    it('roleExists returns true for existing roles', async () => {
        assert.isTrue(await rbac.roleExists(ROOT_ROLE));
    });

    itShouldThrow(
        'hasRole throws for non existing roles.',
        async () => {
            await rbac.hasRole(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    it('hasRole returns false for non existing memberships', async () => {
        assert.isFalse(await rbac.hasRole(user1, ROOT_ROLE));
    });

    itShouldThrow(
        'addRole requires an existing admin role.',
        async () => {
            await rbac.addRole(ADDED_ROLE, ADDED_ROLE, { from: user1 });
        },
        'Admin role doesn\'t exist.',
    );

    itShouldThrow(
        'addRole requires msg.sender bearing the admin role.',
        async () => {
            await rbac.addRole(ADDED_ROLE, ROOT_ROLE, { from: user1 });
        },
        'Not admin of role.',
    );

    it('addRole adds a new role.', async () => {
        const roleId = (
            await rbac.addRole(ADDED_ROLE, ROOT_ROLE, { from: root })
        ).logs[0].args.roleId;
        assert.isTrue(await rbac.roleExists(roleId));
    });

    itShouldThrow(
        'addMember throws on non existing roles',
        async () => {
            await rbac.addMember(user1, ADDED_ROLE, { from: user1 });
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'addMember throws on non authorized users',
        async () => {
            await rbac.addMember(user2, ROOT_ROLE, { from: user2 });
        },
        'User can\'t add members.',
    );

    itShouldThrow(
        'addMember throws if the member already belongs to the role.',
        async () => {
            await rbac.addMember(root, ROOT_ROLE, { from: root });
        },
        'Address is member of role.',
    );

    it('addMember adds a member to a role.', async () => {
        await rbac.addMember(user2, ROOT_ROLE, { from: root });
        assert.isTrue(await rbac.hasRole(user2, ROOT_ROLE));
    });

    itShouldThrow(
        'removeMember throws on non existing roles',
        async () => {
            await rbac.removeMember(user1, ADDED_ROLE, { from: user1 });
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'removeMember throws on non authorized users',
        async () => {
            await rbac.removeMember(root, ROOT_ROLE, { from: user2 });
        },
        'User can\'t remove members.',
    );

    itShouldThrow(
        'removeMember throws if the member doesn\'t belong to the role.',
        async () => {
            await rbac.removeMember(user2, ROOT_ROLE, { from: root });
        },
        'Address is not member of role.',
    );

    it('removeMember removes a member from a role.', async () => {
        await rbac.addMember(user2, ROOT_ROLE, { from: root });
        assert.isTrue(await rbac.hasRole(user2, ROOT_ROLE));
        await rbac.removeMember(user2, ROOT_ROLE, { from: root });
        assert.isFalse(await rbac.hasRole(user2, ROOT_ROLE));
    });
});
