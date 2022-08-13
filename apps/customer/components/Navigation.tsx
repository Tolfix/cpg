import React, { ReactNode, useEffect, useState } from 'react';
import
{
    IconButton,
    Avatar,
    Box,
    CloseButton,
    Flex,
    HStack,
    VStack,
    Icon,
    useColorModeValue,
    Link,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Image
} from '@chakra-ui/react';
import
{
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiMenu,
    FiBell,
    FiChevronDown,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import { FaDollarSign } from "react-icons/fa";
import { ICustomer } from "interfaces/Customer.interface";
import { useRouter } from 'next/router';
import { signOut } from "next-auth/react";
import { ICompanyData } from '../interfaces/CompanyData';

interface LinkItemProps
{
    name: string;
    url: string;
    icon: IconType;
}

const LinkItems: Array<LinkItemProps> = [
    { name: 'Home', icon: FiHome, url: '/' },
    { name: 'Invoices', icon: FiTrendingUp, url: '/invoices' },
    { name: 'Quotes', icon: FiCompass, url: '/quotes' },
    { name: 'Orders', icon: FiStar, url: '/orders' },
    { name: 'Transactions', icon: FaDollarSign, url: '/transactions' },
    { name: 'Profile', icon: FiBell, url: '/profile' }
];

function Navigation({
    children,
    profile,
    company
}: {
    children: ReactNode,
    profile: ICustomer;
    company: ICompanyData;
})
{
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent
                company={company}
                onClose={() => onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <SidebarContent company={company} onClose={onClose} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} company={company} profile={profile} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {children}
            </Box>
        </Box>
    );
}

interface SidebarProps extends BoxProps
{
    onClose: () => void;
    company: ICompanyData
}

const SidebarContent = ({ onClose, company, ...rest }: SidebarProps) =>
{
    const router = useRouter();
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}
        >
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Image
                    boxSize='75px'
                    src={company.COMPANY_LOGO}
                />
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    {company.COMPANY_NAME}
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem bg={router.pathname === link.url ? "cyan.200" : ''} url={link.url} key={link.name} icon={link.icon}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    );
};

interface NavItemProps extends FlexProps
{
    url: string;
    icon: IconType;
    children: ReactText;
}

const NavItem = ({ url, icon, children, ...rest }: NavItemProps) =>
{
    return (
        <Link href={url} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'cyan.400',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Link>
    );
};

interface MobileProps extends FlexProps
{
    onOpen: () => void;
    profile: ICustomer;
    company: ICompanyData;
}

const MobileNav = ({ onOpen, profile, company, ...rest }: MobileProps) =>
{

    const [username, setUsername] = useState(`${profile?.personal?.first_name} ${profile?.personal?.last_name}` || "Set your name!");
    const [userImg, setUserImg] = useState<null | string>(null)
    const [userEmail, setUserEmail] = useState(profile?.personal.email ?? "")

    const fetchProfilePicture = async () =>
    {
        const picture = await fetch(
            `${company.CPG_DOMAIN}/v2/images/${profile.profile_picture}`
        ).then(e => e.json());
        const base64 = `data:${picture.mime};base64,${picture.data}`;
        return base64;
    }

    useEffect(() =>
    {
        fetchProfilePicture().then(setUserImg);
    }, [setUserImg])

    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Image
                display={{ base: 'flex', md: 'none' }}
                boxSize='100px'
                src={company.COMPANY_LOGO}
            />

            <HStack spacing={{ base: '0', md: '6' }}>
                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiBell />}
                />
                <Flex alignItems={'center'}>
                    <Menu>
                        <MenuButton
                            py={2}
                            transition="all 0.3s"
                            _focus={{ boxShadow: 'none' }}>
                            <HStack>
                                <Avatar
                                    size={'sm'}
                                    src={userImg ?? "Loading..."}
                                />
                                <VStack
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-start"
                                    spacing="1px"
                                    ml="2">
                                    <Text fontSize="sm">{username ?? "Loading..."}</Text>
                                    <Text fontSize="xs" color="gray.600">
                                        {userEmail ?? "Loading..."}
                                    </Text>
                                </VStack>
                                <Box display={{ base: 'none', md: 'flex' }}>
                                    <FiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={useColorModeValue('white', 'gray.900')}
                            borderColor={useColorModeValue('gray.200', 'gray.700')}>
                            <MenuItem onClick={() =>
                            {
                                window.location.href = `/profile`;
                            }}>
                                Profile
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem onClick={() =>
                            {
                                signOut();
                            }}
                            >
                                Sign out
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};

export default Navigation;