import {
  Button,
  Stack,
} from '@shopify/polaris';


export default function Actions({ onPrimary, onClose, title }) {
  return (
    <div className="pb-10">
      <Stack spacing="none" distribution="fill">
        { onClose ? <Button title="Cancel" onClick={() => { onClose(); }}> Cancel </Button> : '' }
        { onPrimary ? 
          <Stack distribution="trailing">
            <Button onClick={() => { onPrimary();} } primary > {title} </Button>
          </Stack> : ''
        }
      </Stack>
    </div>

  );
}