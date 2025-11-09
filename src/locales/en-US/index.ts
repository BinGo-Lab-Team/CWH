import type {AbstractIntlMessages} from 'next-intl';

import common from './common.json';
import login from './login.json';
import register from './register.json';

const messages = {
	common,
	login,
	register,
} satisfies AbstractIntlMessages;

export default messages;
