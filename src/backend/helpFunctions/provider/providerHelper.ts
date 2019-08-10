import Series from '../../controller/objects/series';
import SameIdAndUniqueId from './sameIdAndUniqueId';
import { ListProviderLocalData } from '../../controller/objects/listProviderLocalData';
import Name from '../../controller/objects/meta/name';
import InfoProvider from '../../api/infoProvider';
import ListProvider from '../../api/ListProvider';
import listHelper from '../listHelper';

export default new class ProviderHelper {
    public async checkListProviderId(a: Series, b: Series): Promise<SameIdAndUniqueId> {
        try{
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider && aProvider.id === bProvider.id) {
                        if (aProvider.targetSeason === bProvider.targetSeason) {
                            aProvider = Object.assign(new ListProviderLocalData(), aProvider);
                            return new SameIdAndUniqueId(true, aProvider.getListProviderInstance().hasUniqueIdForSeasons);
                        }
                    }
                }
            }
        }catch(err){
            console.log(err);
        }
        return new SameIdAndUniqueId();
    }

    public async hasSameListProvider(a: Series, b: Series): Promise<boolean>{
        try{
            for (let aProvider of a.getListProvidersInfos()) {
                for (const bProvider of b.getListProvidersInfos()) {
                    if (aProvider.provider === bProvider.provider) {
                        return true;
                    }
                }
            }
            
        }catch(err){
            console.log(err);
        }
        return false;
    }

    public async getProviderSeriesInfoByName(series:Series,provider: ListProvider | InfoProvider): Promise<Series>{
        const names = await series.getAllNames();
        const alreadySearchedNames: string[] = [];
        let firstname = names[0].name;
        try{
            firstname = await Name.getRomajiName(names);
        }catch(err){}
        console.log("["+provider.providerName+"] Request (Search series info by name) with value: "+firstname);
        let data = null;
        try{
            data = await provider.getMoreSeriesInfoByName(series,firstname);
        }catch(err){}
        if(!data){
            alreadySearchedNames.push(firstname);
            for (const name of names) {
                if(alreadySearchedNames.findIndex(x=>name.name===x) === -1 && name.name){
                    console.log("["+provider.providerName+"] Request (Search series info by name) with value: "+name.name);
                    try{
                        data = await provider.getMoreSeriesInfoByName(series,name.name);
                    }catch(err){}
                    if(data){
                         console.log("["+provider.providerName+"] Request success 🎉");
                        return data;
                    }
                    alreadySearchedNames.push(name.name);
                }
            }
        }else{
            console.log("["+provider.providerName+"] Request success 🎉");
            return data;
        }
        console.log("["+provider.providerName+"] Request failed ☹");
        throw 'no series info found by name'; 
    }
}
