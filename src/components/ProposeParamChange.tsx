import { Amount } from '@agoric/ertp';
import { LoadStatus, usePublishedDatum, WalletContext } from 'lib/wallet';
import { useContext, useState } from 'react';
import { AmountInput, PercentageInput } from './inputs';

interface Props {
  anchorName: string;
  psmCharterOfferId: number;
}

export type ParameterValue =
  | {
      type: 'invitation';
      value: Amount<'set'>;
    }
  | {
      type: 'ratio';
      value: { numerator: Amount<'nat'>; denominator: Amount<'nat'> };
    }
  | {
      type: 'amount';
      value: Amount;
    };

export default function ProposeParamChange(props: Props) {
  const walletUtils = useContext(WalletContext);
  const { data, status } = usePublishedDatum(
    `psm.IST.${props.anchorName}.governance`
  );
  const [minutesUntilClose, setMinutesUntilClose] = useState(10);

  const [paramPatch, setParamPatch] = useState({});

  console.log('ProposeParamChange', { data, paramPatch });

  const canGovern = !!props.psmCharterOfferId;

  function displayParam(name: string, { type, value }: ParameterValue) {
    switch (type) {
      case 'amount':
        return (
          <AmountInput
            value={(paramPatch[name] || value).value}
            brand={value.brand}
            onChange={newVal =>
              setParamPatch({
                ...paramPatch,
                [name]: { brand: value.brand, value: newVal },
              })
            }
          />
        );
      case 'ratio':
        return (
          <PercentageInput
            ratio={paramPatch[name] || value}
            onChange={newRatio =>
              setParamPatch({
                ...paramPatch,
                [name]: newRatio,
              })
            }
          />
        );
      default:
        return <i>{type} not supported</i>;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log({ event });
    const offer = walletUtils.makeVoteOnParamChange(
      props.psmCharterOfferId,
      props.anchorName,
      paramPatch,
      minutesUntilClose
    );
    walletUtils.sendOffer(offer);
  }

  // XXX tell user when the storage node doesn't exist, i.e. invalid anchor
  if (status !== LoadStatus.Received) {
    return <em>waiting for existing parameter values</em>;
  }

  // styling examples https://tailwindcss-forms.vercel.app/
  return (
    <div className="block mt-16">
      <h2>Params</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(data.current).map(([name, value]) => (
          <label className="block" key={name}>
            <span className="text-gray-700">{name}</span>
            <div className="form-input mt-1 block w-full">
              {displayParam(name, value as ParameterValue)}
            </div>
          </label>
        ))}

        <label className="block">
          <span className="text-gray-700">Minutes until close of vote</span>
          <input
            type="number"
            className="mt-1 block w-full"
            value={minutesUntilClose}
            onChange={e => setMinutesUntilClose(e.target.valueAsNumber)}
          />
        </label>

        <input
          type="submit"
          value="Propose param change"
          className="btn-primary p-1 rounded mt-2"
          disabled={!canGovern}
        />
      </form>
    </div>
  );
}
