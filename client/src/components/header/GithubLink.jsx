import React from 'react';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export default function GithubLink () {
	return (
		<a
			href="https://github.com/jiaying-liu/stockerage"
			target="_blank"
			rel="noopener noreferrer"
		>
			<IconButton style={{ color: 'white' }}>
				<FontAwesomeIcon icon={faGithub} />
			</IconButton>
		</a>
	);
}
